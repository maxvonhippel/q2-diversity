# ----------------------------------------------------------------------------
# Copyright (c) 2016-2017, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import json
import os
import pkg_resources
import shutil
from urllib.parse import quote

import scipy
import numpy as np
import pandas as pd
import qiime2
from statsmodels.sandbox.stats.multicomp import multipletests
import q2templates

import biom
import skbio
from itertools import product
from ._method import non_phylogenetic_metrics, alpha
from q2_feature_table import rarefy

TEMPLATES = pkg_resources.resource_filename('q2_diversity', '_alpha')


def alpha_group_significance(output_dir: str, alpha_diversity: pd.Series,
                             metadata: qiime2.Metadata) -> None:
    metadata_df = metadata.to_dataframe()
    metadata_df = metadata_df.apply(pd.to_numeric, errors='ignore')
    pre_filtered_cols = set(metadata_df.columns)
    metadata_df = metadata_df.select_dtypes(exclude=[np.number])
    post_filtered_cols = set(metadata_df.columns)
    filtered_numeric_categories = pre_filtered_cols - post_filtered_cols
    filtered_group_comparisons = []

    categories = metadata_df.columns
    metric_name = alpha_diversity.name

    if len(categories) == 0:
        raise ValueError('Only numeric data is present in metadata file.')

    filenames = []
    filtered_categories = []
    for category in categories:
        metadata_category = metadata.get_category(category).to_series()
        metadata_category = metadata_category.loc[alpha_diversity.index]
        metadata_category = metadata_category.replace(r'', np.nan).dropna()

        initial_data_length = alpha_diversity.shape[0]
        data = pd.concat([alpha_diversity, metadata_category], axis=1,
                         join='inner')
        filtered_data_length = data.shape[0]

        names = []
        groups = []
        for name, group in data.groupby(metadata_category.name):
            names.append('%s (n=%d)' % (name, len(group)))
            groups.append(list(group[alpha_diversity.name]))

        if (len(groups) > 1 and len(groups) != len(data.index)):
            escaped_category = quote(category)
            filename = 'category-%s.jsonp' % escaped_category
            filenames.append(filename)

            # perform Kruskal-Wallis across all groups
            kw_H_all, kw_p_all = scipy.stats.mstats.kruskalwallis(*groups)

            # perform pairwise Kruskal-Wallis across all pairs of groups and
            # correct for multiple comparisons
            kw_H_pairwise = []
            for i in range(len(names)):
                for j in range(i):
                    try:
                        H, p = scipy.stats.mstats.kruskalwallis(groups[i],
                                                                groups[j])
                        kw_H_pairwise.append([names[j], names[i], H, p])
                    except ValueError:
                        filtered_group_comparisons.append(
                            ['%s:%s' % (category, names[i]),
                             '%s:%s' % (category, names[j])])
            kw_H_pairwise = pd.DataFrame(
                kw_H_pairwise, columns=['Group 1', 'Group 2', 'H', 'p-value'])
            kw_H_pairwise.set_index(['Group 1', 'Group 2'], inplace=True)
            kw_H_pairwise['q-value'] = multipletests(
                kw_H_pairwise['p-value'], method='fdr_bh')[1]
            kw_H_pairwise.sort_index(inplace=True)
            pairwise_fn = 'kruskal-wallis-pairwise-%s.csv' % escaped_category
            pairwise_path = os.path.join(output_dir, pairwise_fn)
            kw_H_pairwise.to_csv(pairwise_path)

            with open(os.path.join(output_dir, filename), 'w') as fh:
                df = pd.Series(groups, index=names)

                fh.write("load_data('%s'," % category)
                df.to_json(fh, orient='split')
                fh.write(",")
                json.dump({'initial': initial_data_length,
                           'filtered': filtered_data_length}, fh)
                fh.write(",")
                json.dump({'H': kw_H_all, 'p': kw_p_all}, fh)
                fh.write(",'")
                table = kw_H_pairwise.to_html(classes="table table-striped "
                                              "table-hover")
                table = table.replace('border="1"', 'border="0"')
                fh.write(table.replace('\n', ''))
                fh.write("','%s', '%s');" % (quote(pairwise_fn), metric_name))
        else:
            filtered_categories.append(category)

    index = os.path.join(
        TEMPLATES, 'alpha_group_significance_assets', 'index.html')
    q2templates.render(index, output_dir, context={
        'categories': [quote(fn) for fn in filenames],
        'filtered_numeric_categories': ', '.join(filtered_numeric_categories),
        'filtered_categories': ', '.join(filtered_categories),
        'filtered_group_comparisons':
            '; '.join([' vs '.join(e) for e in filtered_group_comparisons])})

    shutil.copytree(
        os.path.join(TEMPLATES, 'alpha_group_significance_assets', 'dst'),
        os.path.join(output_dir, 'dist'))


_alpha_correlation_fns = {'spearman': scipy.stats.spearmanr,
                          'pearson': scipy.stats.pearsonr}


def alpha_correlation(output_dir: str,
                      alpha_diversity: pd.Series,
                      metadata: qiime2.Metadata,
                      method: str='spearman') -> None:
    try:
        alpha_correlation_fn = _alpha_correlation_fns[method]
    except KeyError:
        raise ValueError('Unknown alpha correlation method %s. The available '
                         'options are %s.' %
                         (method, ', '.join(_alpha_correlation_fns.keys())))
    metadata_df = metadata.to_dataframe()
    metadata_df = metadata_df.apply(pd.to_numeric, errors='ignore')
    pre_filtered_cols = set(metadata_df.columns)
    metadata_df = metadata_df.select_dtypes(include=[np.number])
    post_filtered_cols = set(metadata_df.columns)
    filtered_categories = pre_filtered_cols - post_filtered_cols

    categories = metadata_df.columns

    if len(categories) == 0:
        raise ValueError('Only non-numeric data is present in metadata file.')

    filenames = []
    for category in categories:
        metadata_category = metadata_df[category]
        metadata_category = metadata_category.loc[alpha_diversity.index]
        metadata_category = metadata_category.dropna()

        # create a dataframe containing the data to be correlated, and drop
        # any samples that have no data in either column
        df = pd.concat([metadata_category, alpha_diversity], axis=1,
                       join='inner')

        # compute correlation
        correlation_result = alpha_correlation_fn(df[metadata_category.name],
                                                  df[alpha_diversity.name])

        warning = None
        if alpha_diversity.shape[0] != df.shape[0]:
            warning = {'initial': alpha_diversity.shape[0],
                       'method': method.title(),
                       'filtered': df.shape[0]}

        escaped_category = quote(category)
        filename = 'category-%s.jsonp' % escaped_category
        filenames.append(filename)

        with open(os.path.join(output_dir, filename), 'w') as fh:
            fh.write("load_data('%s'," % category)
            df.to_json(fh, orient='split')
            fh.write(",")
            json.dump(warning, fh)
            fh.write(",")
            json.dump({
                'method': method.title(),
                'testStat': '%1.4f' % correlation_result[0],
                'pVal': '%1.4f' % correlation_result[1],
                'sampleSize': df.shape[0]}, fh)
            fh.write(");")

    index = os.path.join(TEMPLATES, 'alpha_correlation_assets', 'index.html')
    q2templates.render(index, output_dir, context={
        'categories': [quote(fn) for fn in filenames],
        'filtered_categories': ', '.join(filtered_categories)})

    shutil.copytree(os.path.join(TEMPLATES, 'alpha_correlation_assets', 'dst'),
                    os.path.join(output_dir, 'dist'))


def get_stats(group):
    try:
        return {'2': group.quantile(q=0.02),
                '9': group.quantile(q=0.09),
                '25': group.quantile(q=0.25),
                '50': group.quantile(q=0.5),
                '75': group.quantile(q=0.75),
                '91': group.quantile(q=0.91),
                '98': group.quantile(q=0.98)}
    except:
        # NOTE: THIS IS A PROBLEM WITH CONFIDENCE RANGES, WHICH MAY ALSO
        # BE A PROBLEM IN OTHER METHODS & VISUALIZERS.  THIS NEEDS TO BE
        # ADDRESSED AT SOME POINT.
        return {}


def categorical_df(category, metadata_df, v, iterations):
    metadata_category = metadata_df[category]
    metadata_category = metadata_category.loc[v.index.levels[0]]
    metadata_category = metadata_category.dropna()
    v[category] = [metadata_category[row.name[0]]
                   for _, row in v.iterrows()]
    rows = []
    for name, group in v.groupby([category, 'depth']):
        gr = group.iloc[:, 0:iterations-1]
        depth = gr.index.tolist()[0][1]
        rows.append({**{'depth': depth}, **{category: quote(name[0])},
                     **get_stats(gr.sum(axis=0))})
    return pd.DataFrame(rows)


def non_categorical_df(v, iterations):
    rows = []
    for name, group in v:
        gr = group.iloc[:, 0:iterations-1]
        depth = gr.index.tolist()[0][1]
        rows.append({**{'sample-id': gr.index.get_level_values(0)[0]},
                     **{'depth': depth},
                     **get_stats(gr.sum(axis=0))})
    return pd.DataFrame(rows)


def write_jsonp(output_dir, filename, metric, data, warnings, category):
    with open(os.path.join(output_dir, filename), 'w') as fh:
        fh.write("load_data('%s', '%s'," % (metric, category))
        data.to_json(fh, orient='split')
        fh.write(",")
        json.dump(warnings, fh)
        fh.write(");")


def alpha_rarefaction(output_dir: str,
                      feature_table: biom.Table,
                      phylogeny: skbio.TreeNode=None,
                      metrics: set=None,
                      metadata: qiime2.Metadata=None,
                      min_depth: int=1,
                      max_depth: int=100,
                      steps: int=10,
                      iterations: int=10) -> None:
    warnings = []
    filenames = []
    categories = []
    _metrics = []
    for m in metrics:
        if m not in non_phylogenetic_metrics():
            warnings.append("Warning: requested metric %s "
                            "not a known metric." % m)
        elif m in [ 'osd', 'lladser_ci', 'strong', 'esty_ci',
                  'kempton_taylor_q', 'chao1_ci' ]:
            warnings.append("Warning: requested metric %s "
                            "not an integer-valued metric."
                            % m)
        else:
            _metrics.append(m)
    metrics = _metrics

    # TODO: replace these casts with input validation
    max_depth = int(min(max_depth, feature_table.nnz))
    min_depth = int(min_depth)
    step_size = int(max((max_depth - min_depth) / steps, 1))
    # -----------------------------------------------

    depth_range = range(min_depth, max_depth, step_size)
    iter_range = range(1, iterations)

    rows = feature_table.ids()
    cols = pd.MultiIndex.from_product([list(depth_range), list(iter_range)],
                                      names=['depth', 'iter'])
    data = {k: pd.DataFrame(np.NaN, rows, cols) for k in metrics}

    for d, i in product(depth_range, iter_range):
        rt = rarefy(feature_table, d)
        for m in metrics:
            try:
                vector = alpha(table=rt, metric=m)
                data[m][(d, i)] = vector
            except Exception as e:
                # see NOTE in get_stats() regarding confidence intervals
                warnings.append(str(e))
                pass

    for (k, v) in data.items():
        metric_name = quote(k)
        filename = '%s.csv' % metric_name
        with open(os.path.join(output_dir, filename), 'w') as fh:
            # I think move some collation stats into here probably
            v = v.stack('depth')
            v.to_csv(fh, index_label=['sample-id', 'depth'])

        if metadata is None:
            jsonp_filename = '%s.jsonp' % metric_name
            vc = v.groupby([v.index.get_level_values(0), 'depth'])
            n_df = non_categorical_df(vc, iterations)
            write_jsonp(output_dir, jsonp_filename, metric_name, n_df,
                        warnings, '')
            filenames.append(jsonp_filename)
        else:
            metadata_df = metadata.to_dataframe()
            metadata_df = metadata_df.select_dtypes(exclude=[np.number])
            categories = metadata_df.columns
            for category in categories:
                category_name = quote(category)
                jsonp_filename = "%s-%s.jsonp" % (metric_name, category_name)
                c_df = categorical_df(category_name, metadata_df, v,
                                      iterations)
                write_jsonp(output_dir, jsonp_filename, metric_name,
                            c_df, warnings, category_name)
                filenames.append(jsonp_filename)

    index = os.path.join(TEMPLATES, 'alpha_rarefaction_assets', 'index.html')
    q2templates.render(index, output_dir,
                       context={'metrics': list(metrics),
                                'filenames': filenames,
                                'categories': list(categories)})

    shutil.copytree(os.path.join(TEMPLATES, 'alpha_rarefaction_assets', 'dst'),
                    os.path.join(output_dir, 'dist'))

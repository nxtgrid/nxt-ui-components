import downloadjs from 'downloadjs';
import { baseSupabaseRepo } from '@nxt/libraries/api-connection/repo/baseSupabaseRepo';
import { createILikeOrString } from '@nxt/libraries/supabase-helpers';
import { SUPABASE_QUERY_LIMIT } from '@nxt/libraries/constants';

export const createSupabaseRestClient = ({ pgRestOptions: { select, from, withDeleted, searchPaths = [], download = {} }, hiddenFilters }) => {
  const fetch = async (variables, { isDownload, downloadSettings } = {}) => {
    const _query = baseSupabaseRepo.client
      .from(from)
      .select(isDownload && download.select ? download.select : select, { count: 'exact' })
    ;

    if(isDownload) {
      _query.limit(SUPABASE_QUERY_LIMIT);
    }
    else {
      _query.range(variables.offset, variables.offset + (variables.limit - 1));
    }

    if(variables.sort) {
      // @TODO :: This probably will only work with one level of nesting,
      // otherwise we need to use a reduceRight or something similar
      const sortPath = variables.sort.split('.').reduce((accStr, field, index) => {
        if(index === 0) return field;
        return accStr + `(${ field })`;
      }, '');
      _query.order(sortPath, { ascending: variables.order !== 'desc' });
    }

    if(!withDeleted) {
      _query.is('deleted_at', null);
    }

    const allFilters = { ...variables.filters, ...hiddenFilters  };

    for (const [ field, value ] of Object.entries(allFilters)) {
      if(field === 'or') _query.or(value);
      else if(field === 'filter') _query.filter(...value.split('*'));
      else if(field === 'is') _query.is(...value);
      else if(field === 'not') _query.not(...value);
      else if(field === 'in') _query.in(...value);
      else if(value !== undefined) _query.eq(field, value);
    }

    if(downloadSettings?.filters) {
      downloadSettings.filters.forEach(({ method, column, value }) => {
        _query[method](column, value);
      });
    }

    if(variables.search.length) {
      if(!searchPaths.length) {
        console.warn('[To Developer] No search paths provided for this table');
      }
      else if(searchPaths.length === 1)
        _query.ilike(searchPaths[0], `%${ variables.search }%`);
      else
        _query.or(createILikeOrString(searchPaths, variables.search));

      // @TOCHECK :: Hopefully in the future we can use or on both related and own columns
      // _query.or(`accounts.full_name.ilike.%${ variables.search }%,accounts.phone.ilike.%${ variables.search }%`/* , { referencedTable: 'accounts' } */);
    }

    if(isDownload) _query.csv();

    const start = performance.now();
    const { error, data, count } = await _query;
    const end = performance.now();
    const length = Math.round(end - start);
    console.info(`Table data took ${ length }ms to fetch.`);

    if(error) throw error;
    return isDownload
      ? downloadjs(data, `${ download.fileName ?? from }.csv`, 'text/csv')
      : {
        entries: data,
        totalRecords: count,
      }
    ;
  };

  return { fetch };
};

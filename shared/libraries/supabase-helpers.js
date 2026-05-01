export const createILikeOrString = (paths, searchTerm) => paths.map(path => `${ path }.ilike.%${ searchTerm }%`).join(',');

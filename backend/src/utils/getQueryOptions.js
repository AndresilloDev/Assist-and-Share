import { parseQueryFilters } from "./parseQueryFilters.js";

export const getQueryOptions = (req) => {
    const { sort, select, page, limit, populate, ...rawFilters } = req.query;

    const filters = parseQueryFilters(rawFilters);

    const options = {
        filters,
        sort,
        select,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        populate,
    };

    return options;
}
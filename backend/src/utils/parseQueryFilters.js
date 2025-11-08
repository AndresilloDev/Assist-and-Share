export const parseQueryFilters = (query) => {
    const filters = {};

    for (const key in query) {
        const match = key.match(/^(\w+)\[(\w+)\]$/);
        if (match) {
            const field = match[1];
            const operator = match[2];
            const value = query[key];

            if (!filters[field]) filters[field] = {};

            switch (operator) {
                case "regex":
                    // Escapar caracteres especiales
                    filters[field]["$regex"] = new RegExp(value, "i");
                    break;
                case "in":
                    filters[field]["$in"] = value.split(",");
                    break;
                case "gt":
                case "gte":
                case "lt":
                case "lte":
                    filters[field][`$${operator}`] = Number(value);
                    break;
                default:
                    filters[field][`$${operator}`] = value;
            }
        } else {
            filters[key] = query[key];
        }
    }

    return filters;
};

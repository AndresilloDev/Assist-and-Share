export const buildQuery = async (model, queryOptions) => {
    const { filters = {}, sort, select, page = 1, limit = 20, populate } = queryOptions;

    let query = model.find(filters);

    if (select) query = query.select(select.split(",").join(" "));

    if (sort) {
        query = query.sort(sort.split(",").join(" "));
    } else {
        query = query.sort("-createdAt");
    }

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (populate) query = query.populate(populate);

    const total = await model.countDocuments({ ...filters });

    const results = await query.exec();

    return {
        results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

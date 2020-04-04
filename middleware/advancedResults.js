const advancedResults = (model,populate) => async (req,res,next) =>{
    let query;

    // copy req query
    const reqQuery = { ...req.query };
    // fields to exclude
    const removeFields = ['select','sort','page','limit'];
    // loop over fields and delete from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // create query string
    let queryStr = JSON.stringify(reqQuery);
    // create operators ge,gte etc...
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // finding resource
    query = model.find(JSON.parse(queryStr));
    // SELECT fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    // Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else {
        query = query.sort('-createdBy');
    }
    // Pagenation
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const  startIndex = (page - 1) * limit;
    console.log("startIndex..."+startIndex);
    const endIndex = page * limit;
    const  total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate);
    }
        // exectuting query
        const results = await query;
        // Pagenation
        const pagenation = {};
        if(endIndex < total){
            pagenation.next = {
                page : page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagenation.prev = {
                page : page - 1,
                limit
            }
        }

        res.advancedResults = {
            success : true,
            count : results.length,
            pagenation,
            data : results
        }

        next();
}

module.exports = advancedResults;
exports.handle500Errors = (err, req, res, next)=> {
    console.log(err);
    res.status(500).send({msg: "Server error"})
}

exports.handle400Errors = (err, req, res, next) => {
    console.log(err);
    if (err.code === "22P02") {
        res.status(400).send({msg: "Bad Request"})
    }
    else {
        next(err)
    }
}

exports.handleCustomErrors = (err, req, res, next) => {
    if (err.msg) {
        res.status(err.status).send({msg: err.msg})
    }
    next(err)
}
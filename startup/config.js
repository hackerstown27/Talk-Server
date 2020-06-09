const express = require("express");
const cors = require("cors");

module.exports = function(app){
    const corsOptions = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 200,
        allowedHeaders: "*",
        exposedHeaders: "*",
    };
    
    app.use(express.json());
    app.use(cors(corsOptions));
}
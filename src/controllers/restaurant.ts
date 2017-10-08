import * as async from "async";
import * as passport from "passport";
import { default as Restaurant, RestaurantModel}  from "../models/Restaurant";
import { Request, Response, NextFunction } from "express";
import { WriteError } from "mongodb";

const request = require("express-validator");

/**
 * GET /restaurant/list
 * Get List page
 */
export let getList = (req: Request, res: Response, next: NextFunction) => {
    // const restaurants = Restaurant.find({}).limit(5);
    // const restaurants = Restaurant.findOne();
    Restaurant.find({}, (err, result) => {
        if (err) { return next(err); }
        console.log(result);
        res.render("restaurant/list", {
            title: "List of restaurants",
            restaurants: result
        });
    });
};

/**
 * GET /restaurant/detail
 * @param req
 * @param res
 */
export let getDetail = (req: Request, res: Response, next: NextFunction) => {
    Restaurant.findById(req.params.id, (err, record) => {
        if (err) {
            req.flash("errors", err);
            return res.redirect("/restaurant/create");
        }
        if (record) {
            return res.render("restaurant/detail", {
                title: "Detail page",
                record: record
            });
        }
        res.redirect("/restaurant/create");
    });
};

/**
 * GET /restaurant/create
 * @param req
 * @param res
 */
export let createDetail = (req: Request, res: Response) => {
    const record = new Restaurant({});
    res.render("restaurant/detail", {
        title: "Create page",
        record: record
    });
};

export let postDetail = (req: Request, res: Response, next: NextFunction) => {
    req.assert("name", "Name is mininum than 1 chars").len({ min: 1 });

    const errors = req.validationErrors();

    if (errors) {
        req.flash("errors", errors);
        return res.redirect("/restaurant/detail/" + req.params.id);
    }

    const resID = req.params.id;
    const restaurant = new Restaurant({
        _id: resID,
        name: req.body.name,
        address: req.body.address,
        geolocation: {
            lat: req.params.lat,
            lon: req.params.lon
        },
        openinghour: req.body.openinghour
    });

    Restaurant.findById(resID, (err, existingRecord) => {
        if (err) {return next(err); }
        if (existingRecord) {
            req.flash("errors", { msg: "Restaurant already exists" });
            return res.redirect("/restaurant/detail/" + resID);
        }
        restaurant.save((err) => {
            if (err) {return next(err); }
            return res.redirect("/restaurant/list");
        });
    });
};

export let postUpdateDetail = (req: Request, res: Response, next: NextFunction) => {
    const restaurantId = req.params.id;
    Restaurant.findById(restaurantId, (err, record: RestaurantModel) => {
        if (err) { return next(err); }
        record.name = req.body.name || "";
        // TODO: update other fields
        record.save((err: WriteError) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash("errors", { msg: "Something wrong" });
                    return res.redirect("/restaurant/detail/" + restaurantId);
                }
                return next(err);
            }
            req.flash("success", { msg: "Restaurant information has been updated." });
            res.redirect("/restaurant/list");
        });
    });
};
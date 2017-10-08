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
export let getList = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }

    const restaurants = Restaurant.findOne();
    //TODO: find all
    res.render("restaurant/list", {
        title: "List of restaurants",
        restaurants: restaurants
    });
};

/**
 * GET /restaurant/detail
 * @param req
 * @param res
 */
export let getDetail = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    const record = Restaurant.findById(req.params.id);
    res.render("restaurant/detail", {
        title: "Detail page",
        record: record
    });
};

export let postDetail = (req: Request, res: Response, next: NextFunction) => {
    req.assert("name", "Name is smaller than 40 chars").len({ min: 4 });

    const errors = req.validationErrors();

    if (errors) {
        req.flash("errors", errors);
        return res.redirect("/restaurant/detail");
    }

    // res.render("restaurant/detail", {
    //    title: "List"
    //  });

    const restaurant = new Restaurant({
        name: req.body.name
    });

    Restaurant.findOne({ name: req.body.name }, (err, existingRecord) => {
        if (err) {
            return next(err);
        }
        if (existingRecord) {
            req.flash("errors", { msg: "Name already exists" });
            return res.redirect("/restaurant/detail");
        }
        restaurant.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/restaurant/detail");
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
                    return res.redirect("/restaurant/detail/"+restaurantId);
                }
                return next(err);
            }
            req.flash("success", { msg: "Restaurant information has been updated." });
            res.redirect("/restaurant/list");
        });
    });
};
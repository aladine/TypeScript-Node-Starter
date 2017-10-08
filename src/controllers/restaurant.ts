import * as async from "async";

/**
 * GET /restautants
 * Get List page
 */

 export let getList = (req: Request, res: Response) => {
     if (req.user) {
         return res.redirect("/");
     }
     res.render("restaurents/list", {
        title: "List"
      });
 }
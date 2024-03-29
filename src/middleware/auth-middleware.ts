import { NextFunction, Request, Response } from "express";
import { Role } from "../models/enums";

// Ensure that the user is authenticated
export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // Redirect to login page if not authenticated
    res.redirect("/auth/login");
  }
};

// Ensure that the user is in the specified role
export const ensureInRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user has the specified role
    if (req.user && req.user.role === role) {
      return next();
    } else {
      // Redirect to unauthorized page if not in role
      res.redirect("/auth/unauthorized");
    }
  };
};

// Ensure that the user is in any of the specified roles
export const ensureInRoles = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user has any of the specified roles
    if (req.user && roles.includes(req.user.role as Role)) {
      return next();
    } else {
      // Redirect to unauthorized page if not in any of the roles
      res.redirect("/auth/unauthorized");
    }
  };
};

// Ensure that the user is an admin
export const ensureAdmin = ensureInRole(Role.ADMIN);

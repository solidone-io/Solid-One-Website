import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (req: Request, res: Response) => Promise<void>;

export function asyncRoute(handler: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

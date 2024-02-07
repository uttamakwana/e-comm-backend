import { NextFunction, Request, Response } from 'express'

// handler function (controller) props
export type ControllerType = (
 req: Request,
 res: Response,
 next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>

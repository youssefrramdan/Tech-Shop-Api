import { catchError } from "../../middlewares/catchError.js"
import { AppError } from "../../utils/appError.js"

export const deleteOne =(model)=>{
  return catchError(async (req , res , next)=>{

    let document = await model.findByIdAndDelete(req.params.id)
    document|| next(new AppError(`${document} not found`))
    !document || res.json({message : "success" , document})
  })
}
export const updateOne =(model)=>{
  return catchError(async (req , res , next)=>{

    let document = await model.findByIdAndUpdate(req.params.id)
    document|| next(new AppError(`${document} not found`))
    !document || res.json({message : "success" , document})
  })
}


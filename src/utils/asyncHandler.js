const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=>next(error))
    }
}
export {asyncHandler}


// const asyncHandler2 = (requesthandler) => {
//     async(req,res,next) => {
//         try {
//             await requesthandler(req,res,next)
//         } catch (error) {
//             res.status(error.status || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// }
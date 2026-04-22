const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  fetch('http://127.0.0.1:7501/ingest/3ad92269-561a-4cf1-89bf-e30f579133ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f005a7'},body:JSON.stringify({sessionId:'f005a7',runId:'post-fix',hypothesisId:'H9',location:'backend/middleware/errorMiddleware.js:errorHandler',message:'error middleware response',data:{method:req?.method||null,path:req?.originalUrl||null,statusCode,errorMessage:err?.message||'unknown'},timestamp:Date.now()})}).catch(()=>{});
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };

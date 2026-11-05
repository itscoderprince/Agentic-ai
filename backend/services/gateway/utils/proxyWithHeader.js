import proxy from "express-http-proxy";

const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 1. Forward cookies so downstream services (like chat) receive the auth session
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }

      // 2. Forward user ID safely if req.user exists in the gateway
      if (srcReq.user?.id) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
      }

      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;

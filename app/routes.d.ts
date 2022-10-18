declare module "routes-gen" {
  export type RouteParams = {
    "/workshops/:workshopId/edit": { "workshopId": string };
    "/workshops/:workshopId": { "workshopId": string };
    "/logout": Record<string, never>;
    "/": Record<string, never>;
    "/login": Record<string, never>;
  };

  export function route<
    T extends
      | ["/workshops/:workshopId/edit", RouteParams["/workshops/:workshopId/edit"]]
      | ["/workshops/:workshopId", RouteParams["/workshops/:workshopId"]]
      | ["/logout"]
      | ["/"]
      | ["/login"]
  >(...args: T): typeof args[0];
}

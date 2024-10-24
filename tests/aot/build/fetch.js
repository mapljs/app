export default (
  f1,
  f2,
  f3,
  f4,
  f5,
  f6,
  f7,
  f8,
  f9,
  f10,
  f11,
  f12,
  f13,
  f14,
  f15,
  f16,
  f17,
  f18,
) => {
  var __mapl_htmlhp = ["content-type", "text/html"],
    __mapl_htmlo = { headers: [__mapl_htmlhp] },
    __mapl_jsonhp = ["content-type", "application/json"],
    __mapl_jsono = { headers: [__mapl_jsonhp] },
    __mapl_r400 = new Response(null, { status: 400 }),
    __mapl_r404 = new Response(null, { status: 404 }),
    __mapl_r500 = new Response(null, { status: 500 });
  return (__req) => {
    let __mapl_m = __req.method;
    if (__mapl_m === "GET") {
      let __mapl_u = __req.url,
        __mapl_ps = __mapl_u.indexOf("/", 12) + 1,
        __mapl_pe = __mapl_u.indexOf("?", __mapl_ps),
        __req_p =
          __mapl_pe === -1
            ? __mapl_u.slice(__mapl_ps)
            : __mapl_u.substring(__mapl_ps, __mapl_pe);
      if (__req_p === "basic") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        f2(__mapl_rc);
        return new Response(f8(), __mapl_rc);
      } else if (__req_p === "basic/static") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        f2(__mapl_rc);
        __mapl_rc.statusText = "Hi";
        __mapl_h.push(...f9);
        return new Response("<p>This is static content</p>", __mapl_rc);
      } else if (__req_p === "basic/response") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        f2(__mapl_rc);
        return f10();
      } else if (__req_p === "patterns") {
        return new Response(f11());
      } else if (__req_p === "auth/yield") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        let __mapl_ph = f4(__mapl_rc);
        if (Array.isArray(__mapl_ph) && __mapl_ph[0] === f0)
          switch (__mapl_ph[1]) {
            case 1: {
              return new Response(f3());
            }
            default:
              return __mapl_r500;
          }
        __mapl_rc.token = __mapl_ph;
        return new Response(f12(__mapl_rc), __mapl_rc);
      } else if (__req_p === "timer") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        __mapl_rc.startTime = f5(__mapl_rc);
        f6(__mapl_rc);
        __mapl_rc.totalTime = f7(__mapl_rc);
        return new Response(f13(__mapl_rc), __mapl_rc);
      } else {
        let __req_pl = __req_p.length;
        switch (__req_p.charCodeAt(0)) {
          case 98:
            if (__req_pl > 10)
              if (__req_p.charCodeAt(1) === 97)
                if (__req_p.charCodeAt(2) === 115)
                  if (__req_p.charCodeAt(3) === 105)
                    if (__req_p.charCodeAt(4) === 99)
                      if (__req_p.charCodeAt(5) === 47)
                        if (__req_p.charCodeAt(6) === 117)
                          if (__req_p.charCodeAt(7) === 115)
                            if (__req_p.charCodeAt(8) === 101)
                              if (__req_p.charCodeAt(9) === 114)
                                if (__req_p.charCodeAt(10) === 47) {
                                  if (__req_p.indexOf("/", 11) === -1) {
                                    let __req_ps = [__req_p.slice(11)];
                                    let __mapl_h = [];
                                    let __mapl_rc = {
                                      status: 200,
                                      req: __req,
                                      headers: __mapl_h,
                                      params: __req_ps,
                                    };
                                    f2(__mapl_rc);
                                    return new Response(
                                      f14(__mapl_rc),
                                      __mapl_rc,
                                    );
                                  }
                                }
            break;
          case 112:
            if (__req_pl > 13)
              if (__req_p.charCodeAt(1) === 97)
                if (__req_p.charCodeAt(2) === 116)
                  if (__req_p.charCodeAt(3) === 116)
                    if (__req_p.charCodeAt(4) === 101)
                      if (__req_p.charCodeAt(5) === 114)
                        if (__req_p.charCodeAt(6) === 110)
                          if (__req_p.charCodeAt(7) === 115)
                            if (__req_p.charCodeAt(8) === 47)
                              if (__req_p.charCodeAt(9) === 117)
                                if (__req_p.charCodeAt(10) === 115)
                                  if (__req_p.charCodeAt(11) === 101)
                                    if (__req_p.charCodeAt(12) === 114)
                                      if (__req_p.charCodeAt(13) === 47) {
                                        if (__req_p.indexOf("/", 14) === -1) {
                                          let __req_ps = [__req_p.slice(14)];
                                          let __mapl_h = [__mapl_htmlhp];
                                          let __mapl_rc = {
                                            status: 200,
                                            req: __req,
                                            headers: __mapl_h,
                                            params: __req_ps,
                                          };
                                          return new Response(
                                            f15(__mapl_rc),
                                            __mapl_rc,
                                          );
                                        }
                                      }
            break;
        }
      }
    } else if (__mapl_m === "POST") {
      let __mapl_u = __req.url,
        __mapl_ps = __mapl_u.indexOf("/", 12) + 1,
        __mapl_pe = __mapl_u.indexOf("?", __mapl_ps),
        __req_p =
          __mapl_pe === -1
            ? __mapl_u.slice(__mapl_ps)
            : __mapl_u.substring(__mapl_ps, __mapl_pe);
      if (__req_p === "basic/json") {
        let __mapl_h = [];
        let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
        f2(__mapl_rc);
        __mapl_h.push(__mapl_jsonhp);
        return (async () =>
          new Response(JSON.stringify(await f16(__mapl_rc)), __mapl_rc))();
      } else if (__req_p === "inline/yield") {
        return (async () => {
          let __mapl_h = [];
          let __mapl_rc = { status: 200, req: __req, headers: __mapl_h };
          let __mapl_ph = await __req.json().catch(() => null);
          if (
            __mapl_ph === null ||
            typeof __mapl_ph !== "object" ||
            typeof __mapl_ph.name !== "string"
          ) {
            return __mapl_r400;
          }
          __mapl_rc.body = __mapl_ph;
          __mapl_h.push(__mapl_jsonhp);
          return new Response(JSON.stringify(f17(__mapl_rc)), __mapl_rc);
        })();
      } else {
        let __req_pl = __req_p.length;
      }
    } else {
      let __mapl_u = __req.url,
        __mapl_ps = __mapl_u.indexOf("/", 12) + 1,
        __mapl_pe = __mapl_u.indexOf("?", __mapl_ps),
        __req_p =
          __mapl_pe === -1
            ? __mapl_u.slice(__mapl_ps)
            : __mapl_u.substring(__mapl_ps, __mapl_pe);
      let __req_pl = __req_p.length;
      if (__req_p.charCodeAt(0) === 112) {
        if (__req_pl > 8)
          if (__req_p.charCodeAt(1) === 97)
            if (__req_p.charCodeAt(2) === 116)
              if (__req_p.charCodeAt(3) === 116)
                if (__req_p.charCodeAt(4) === 101)
                  if (__req_p.charCodeAt(5) === 114)
                    if (__req_p.charCodeAt(6) === 110)
                      if (__req_p.charCodeAt(7) === 115)
                        if (__req_p.charCodeAt(8) === 47) {
                          if (__req_pl !== 9) {
                            let __req_ps = [__req_p.slice(9)];
                            let __mapl_h = [];
                            let __mapl_rc = {
                              status: 200,
                              req: __req,
                              headers: __mapl_h,
                              params: __req_ps,
                            };
                            return new Response(f18(__mapl_rc), __mapl_rc);
                          }
                        }
      }
    }
    return __mapl_r404;
  };
};

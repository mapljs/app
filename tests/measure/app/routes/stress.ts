import { router } from "@mapl/app/index.js";

const app = router()
  .headers({
    server: 'mapl'
  })
  .set('startTime', () => new Date());

for (let i = 0; i < 700; i++)
  app.get(`/${i}/*/dyn/**`,
    i % 3 === 0
      ? (c) => c.startTime.toUTCString()
      : i % 3 === 1
        ? {
          type: 'text',
          fn: (c) => c.params[0] + c.params[1] + c.startTime.toUTCString()
        } : {
          type: 'json',
          fn: (c) => c
        }
  );

export default app;

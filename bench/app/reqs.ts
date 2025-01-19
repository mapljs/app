export const pathMap = {
  '/user': () => 'User',
  '/user/comments': () => 'User Comments',
  '/user/avatar': () => 'User avatar',
  '/user/lookup/email/:one': (address) => 'User Email Address: ' + address,
  '/event/:one': (id) => 'Event: ' + id,
  '/event/:one/comments': () => 'Event Comments',
  '/very/deeply/nested/route/hello/there': () => 'Very Deeply Nested Route',
  '/user/lookup/username/:one': (username) => 'Hello ' + username
} satisfies Record<string, (...params: string[]) => string>;

export const paths = Object.keys(pathMap);
export const requests = Array.from({ length: 5000 }, (_, i) => new Request('http://127.0.0.1' + paths[i % paths.length]));

export const setupTests = async (label: string, assertEquals: (actual: any, expected: any) => any, obj: { fetch: Function }) => {
  const params = new Array(5).fill('' + Math.random());
  console.log('Testing', label);

  for (const path in pathMap) {
    // Path to match
    let idx = 0;
    const exactPath = path.replace(/\/:\w+/g, () => '/' + params[idx++]);
    console.log('* Match path', '"' + exactPath + '"', 'with', '"' + path + '"');

    // Response
    const res = await obj.fetch(
      new Request('http://127.0.0.1' + exactPath)
    );

    assertEquals(
      // @ts-ignore
      pathMap[path as keyof typeof pathMap](...params),
      await res.text()
    );
  }
};

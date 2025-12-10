const VIDEO_GRAPHQL_FIELDS = `
  name
  video
`;

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["videos"] },
    },
  ).then((response) => response.json());
}

function extractVideo(fetchResponse: any): any {
  return fetchResponse?.data?.videoCollection?.items?.[0];
}

export async function getFirstVideo(isDraftMode: boolean): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      videoCollection(limit: 1, preview: ${isDraftMode ? "true" : "false"}) {
        items {
          ${VIDEO_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractVideo(entry);
}
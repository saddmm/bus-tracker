import { type GraphQLSchema } from 'graphql'
import { createYoga } from 'graphql-yoga'

const host = process.env.HOST

const graphqlUrl = host?.startsWith('https') ? host : `${host}:${process.env.PORT}`

export const yogaServer = async (schema: GraphQLSchema) => {
  const yoga = createYoga({
    renderGraphiQL: () => {
      return `
        <!DOCTYPE html>
        <html lang="en">
          <body style="margin: 0; overflow-x: hidden; overflow-y: hidden">
          <div id="sandbox" style="height:100vh; width:100vw;"></div>
          <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
          <script>
          new window.EmbeddedSandbox({
            target: "#sandbox",
            // Pass through your server href if you are embedding on an endpoint.
            // Otherwise, you can pass whatever endpoint you want Sandbox to start up with here.
            initialEndpoint: "${graphqlUrl}/graphql",
          });
          // advanced options: https://www.apollographql.com/docs/studio/explorer/sandbox#embedding-sandbox
          </script>
          </body>
        </html>`
    },
    schema,
  })

  return yoga
}

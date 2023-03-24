import {
    ApolloClient,
    DocumentNode,
    HttpLink,
    InMemoryCache,
  } from '@apollo/client';
  import fetch from 'cross-fetch';
import { CHAIN_INFO } from './chains';
  async function executeQuery(
    chainId: number,
    query: DocumentNode,
  ) {
    const link = new HttpLink({
      uri: CHAIN_INFO[chainId].subgraphClientUrl,
      fetch,
    });
    const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
  
    const response = await client.query({
      query,
      fetchPolicy: 'network-only',
    });
    const { data } = response;
  
    return data;
  }
  
  export { executeQuery }
  
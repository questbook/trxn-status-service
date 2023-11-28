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

   
const ENDPOINT_CLIENT = 'https://vhtdi50rkl.execute-api.ap-southeast-1.amazonaws.com/graphql'

async function executeQueryClient(
    query: DocumentNode,
  ) {
    const link = new HttpLink({
      uri: ENDPOINT_CLIENT,
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
  async function executeMutation(mutation: DocumentNode, variables: any) {
    try{
    const link = new HttpLink({
      uri: ENDPOINT_CLIENT,
      fetch,
    });
    const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
  
    const response = await client.mutate({
      mutation,
      variables,
    });
    const { data,errors } = response;
    console.log('data',data,'errors',errors)
  
    return data;
  } catch (e) {
    console.log('error',e)
  }
}
  

  
  export { executeQuery, executeQueryClient, executeMutation }
 



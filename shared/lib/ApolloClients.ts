// import {ApolloClient, Httplink, InMemoryCache} from "@appllo/client"
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export function CreateApolloclient (){
    return new ApolloClient({
        link: new HttpLink ({
            uri:"/api/graphql",
            credentials: "include"


        }),
        cache:new InMemoryCache()
    })
}




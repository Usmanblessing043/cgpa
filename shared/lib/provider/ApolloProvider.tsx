"use client"

import { CreateApolloclient } from "../ApolloClients";
import { ReactNode } from "react";
import { ApolloProvider as Provider } from "@apollo/client/react";
// import { createApolloClient } from "@/shared/lib/apollo-client"

export default function ApolloProvider({ children }: { children: ReactNode }) {

    const client = CreateApolloclient();

  

    return <Provider client={client}>{children}</Provider>;

  }


  


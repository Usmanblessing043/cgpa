import {mergeTypeDefs, mergeResolvers} from '@graphql-tools/merge'

import { usertypeDefs } from './userTypedev';
import { userresolvers } from './userResolver';
import { postresolvers } from './postResolver';
import { posttypeDefs } from './postTypedev';





export const typeDefs = mergeTypeDefs([
    usertypeDefs, posttypeDefs
])




export const resolvers =  mergeResolvers([
    userresolvers, postresolvers
])
import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const ORDER_EVENTS = {
  NEW_ORDER: "NEW_ORDER",
  ORDER_UPDATED: "ORDER_UPDATED",
};
import { DiscordStyleId } from "../types/style-ids";

export const defaultDiscordMapping: Record<DiscordStyleId, string> = {
  "action-default": "latte-med",
  "action-hover": "latte-thick",
  "nav-item-bg": "black-glass",
  "nav-item-active": "latte-thin",
  "nav-indicator": "smoke-thick",
  separator: "Brd",
  "text-default": "smoke-thick",
  "container-bg": "black-glass",
  "tooltip-bg": "black-glass",
  "hover-bg": "graphite-thin",
  "active-bg": "graphite-med",
  // New server-specific mappings
  "server-header-bg": "black-glass",
  "server-header-hover": "graphite-thin",
  "server-header-border": "Brd",
  "dropdown-bg": "black-glass",
  "dropdown-item-hover": "graphite-glass",
  "dropdown-text": "smoke-thick",
  "invite-text": "latte-med",
  "danger-text": "latte-thick",
  "icon-moderator": "latte-med",
  "icon-admin": "latte-thick",
};

/* -----------------------------------------------------------------------------
 * jsonapi types
 * -------------------------------------------------------------------------- */

/**
 * JsonValue
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Meta
 */
export type Meta = Record<string, JsonValue>;

/**
 * LinkObject
 */
export type LinkObject = {
  href: string;
  rel?: string;
  describedBy?: string;
  title?: string;
  type?: string;
  hreflang?: string;
  meta?: Meta;
};

/**
 * Link
 */
export type Link = null | string | LinkObject;

/**
 * ResourceIdentifier
 */
export type ResourceIdentifier = {
  type: string;
  id: string;
  meta?: Meta;
};

/**
 * RelationshipsLink
 */
export type RelationshipsLink =
  | null
  | { self: Link; [key: string]: Link }
  | { related: Link; [key: string]: Link };

/**
 * ResourceLinkage
 */
export type ResourceLinkage = null | ResourceIdentifier | ResourceIdentifier[];

/**
 * Relationship
 */
export type Relationship =
  | {
      links: RelationshipsLink;
      data?: ResourceLinkage;
      meta?: Meta;
    }
  | {
      links?: RelationshipsLink;
      data: ResourceLinkage;
      meta?: Meta;
    };

/**
 * Attributes
 */
export type Attributes = Record<string, JsonValue>;

/**
 * Resource
 */
export type Resource = {
  type: string;
  id: string;
  attributes: Attributes;
  relationships?: Record<string, Relationship>;
  links?: Record<string, Link>;
  meta?: Meta;
};

/**
 * ResourceCreate
 */
export type ResourceCreate = {
  type: string;
  id?: string;
  attributes: Attributes;
  relationships?: Record<string, Relationship>;
  links?: Record<string, Link>;
  meta?: Meta;
};

/**
 * ErrorObject
 */
export type ErrorObject = {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
    header?: string;
  };
  links?: {
    about?: Link;
    type?: Link;
  };
  meta?: Meta;
};

/**
 * Jsonapi
 */
export type Jsonapi = {
  version?: string;
  ext?: string[];
  profile?: string[];
  meta?: Meta;
};

/**
 * DocumentLinks
 */
export type DocumentLinks = {
  self?: Link;
  related?: Link;
  first?: Link;
  last?: Link;
  prev?: Link;
  next?: Link;
  describedBy?: Link;
};

/**
 * ResourceDocument
 */
export type ResourceDocument = {
  data: Resource | Resource[];
  meta?: Meta;
  links?: DocumentLinks;
  included?: Resource[];
  jsonapi?: Jsonapi;
};

/**
 * ResourceCreateDocument
 */
export type ResourceCreateDocument = {
  data: ResourceCreate | ResourceCreate[];
  meta?: Meta;
  links?: DocumentLinks;
  included?: Resource[];
  jsonapi?: Jsonapi;
};

/**
 * ErrorDocument
 */
export type ErrorDocument = {
  errors?: ErrorObject[];
  meta?: Meta;
  links?: DocumentLinks;
  included?: Resource[];
  jsonapi?: Jsonapi;
};

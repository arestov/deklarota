declare class Model {}

type DependencyDeclaration = string;

// ATTRS
type InputAttrDeclaration<T> = readonly ['input', T];
type AliasAttrDeclaration = readonly ['comp', readonly [DependencyDeclaration]];
type ComputedAttrDeclaration<T, DepKeys extends DependencyDeclaration[], Deps extends any[]> = readonly [
  'comp',
  DepKeys,
  (...deps: Deps) => T
];

type AttrDeclaration<T> = InputAttrDeclaration<T> | AliasAttrDeclaration | ComputedAttrDeclaration<T, string[], any[]>;
type AttrsDeclarations = Readonly<Record<string, AttrDeclaration<unknown>>>;

// RELS
type NestRelationDeclaration<T extends typeof Model> = readonly ['nest', readonly [T]];
type NestLinkRelationDeclaration = readonly ['nest', readonly [string]];
type NestOptions = { idle_until?: string; preload_on?: string };
type NestLinkRelationWithOptionsDeclaration = readonly ['nest', readonly [string, NestOptions]];

type ModelRelationDeclaration<T extends typeof Model> = readonly ['model', T];
type ModelLinkRelationDeclaration = readonly ['model', string];

type ConjModelsDeclarations<RelKeys extends string> = readonly ['conj', RelKeys[]];

type CompareOps = '=' | '!=';
type SelectConditionComparator = CompareOps | ((a: any, b: any) => boolean) | readonly [CompareOps, 'boolean'];
type SelectCondition<SelectConditionCompareValues extends any[]> = readonly [
  SelectConditionComparator,
  SelectConditionCompareValues
];
type SelectRelationDeclaration<RelKeys extends string> = readonly [
  'sel',
  {
    from: RelKeys;
    where?: Record<string, SelectCondition<any[]>>;
    sort?: readonly [string[], (...args: any[]) => number];
  }
];

type AliasRelationDeclaration = readonly ['comp', readonly [DependencyDeclaration]];
type ComputedRelationDeclaration<T, DepKeys extends DependencyDeclaration[], Deps extends any[]> = readonly [
  'comp',
  DepKeys,
  (...deps: Deps) => T
];
type RelationDeclaration<T> =
  | NestRelationDeclaration<typeof Model>
  | NestLinkRelationDeclaration
  | NestLinkRelationWithOptionsDeclaration
  | ModelRelationDeclaration<typeof Model>
  | ModelLinkRelationDeclaration
  | ConjModelsDeclarations<string>
  | SelectRelationDeclaration<string>
  | AliasRelationDeclaration
  | ComputedRelationDeclaration<T, string[], any[]>;
type RelationsDeclarations = Readonly<Record<string, RelationDeclaration<unknown>>>;

// ACTIONS
type WriteDeclaration = readonly [DependencyDeclaration];

type ActionFn<Input, Output> = (input: Input) => Output;
type ActionFnWithDeps<Input, Output, DepKeys extends DependencyDeclaration[], Deps extends any[]> = readonly [
  DepKeys,
  (input: Input, ...deps: Deps) => Output
];

type ShortActionDeclaration<Input, Output> = {
  to: WriteDeclaration;
  fn?: ActionFn<Input, Output>;
};

type FullActionDeclaration<Input, OutputKeys extends string, Output extends Record<OutputKeys, unknown>> = {
  to: Record<OutputKeys, WriteDeclaration>;
  fn?: ActionFn<Input, Output>;
};

type ActionDeclaration = ShortActionDeclaration<unknown, unknown> | FullActionDeclaration<unknown, string, any>;
type ActionsDeclarations = Readonly<Record<string, ActionDeclaration>>;

// EFFECTS

type ShortApiDeclaration<T> = () => T;
type FullApiDeclaration<
  T,
  RequiredAttrKeys extends string,
  RequiredApiKeys extends string,
  RequiredApis extends any[]
> = readonly [RequiredAttrKeys[], RequiredApiKeys[], (...apis: RequiredApis) => T];
type FullApiDeclarationWithDestroy<
  T,
  RequiredAttrKeys extends string,
  RequiredApiKeys extends string,
  RequiredApis extends any[]
> = readonly [RequiredAttrKeys[], RequiredApiKeys[], (...apis: RequiredApis) => T, (api: T) => unknown];
type ApiDeclaration<T> =
  | ShortApiDeclaration<T>
  | FullApiDeclaration<unknown, string, string, any[]>
  | FullApiDeclarationWithDestroy<unknown, string, string, any[]>;

type ApiDeclarations = Readonly<Record<string, ApiDeclaration<unknown>>>;

type UnsubscribeFn = () => void;
type SubscribeEffectDeclaration<Output, RequiredApiKeys extends string, RequiredApis extends any[]> = {
  type: 'subscribe';
  api: RequiredApiKeys[];
  fn: (pass: (value: Output) => void, ...apis: RequiredApis) => UnsubscribeFn;
};

type SubscribeWithShortActionEffectDeclaration<Output, RequiredApiKeys extends string, RequiredApis extends any[]> = {
  type: 'subscribe';
  api: RequiredApiKeys[];
  to: WriteDeclaration;
  fn: (pass: (value: Output) => void, ...apis: RequiredApis) => UnsubscribeFn;
};

type SubscribeWithFullActionEffectDeclaration<
  OutputKeys extends string,
  Output extends Record<OutputKeys, unknown>,
  RequiredApiKeys extends string,
  RequiredApis extends any[]
> = {
  type: 'subscribe';
  api: RequiredApiKeys[];
  to: Record<OutputKeys, WriteDeclaration>;
  fn: (pass: (value: Output) => void, ...apis: RequiredApis) => UnsubscribeFn;
};

type EffectFnWithDeps<Output, Api, Options, DepKeys extends DependencyDeclaration[], Deps extends any[]> = readonly [
  DepKeys,
  (api: Api, options: Options, ...deps: Deps) => Promise<Output>
];

type RequestStateEffectDeclaration<
  RawData extends any,
  WriteAttrKeys extends string,
  ParsedData extends Record<WriteAttrKeys, unknown>,
  RequiredApiKeys extends string
> = {
  type: 'state_request';
  states: WriteAttrKeys[];
  api: RequiredApiKeys;
  parse: (raw: RawData) => ParsedData;
  fn: EffectFnWithDeps<RawData, any, Record<string, unknown>, string[], any[]>;
};

type RequestNestingEffectDeclaration<
  RawData extends any,
  WriteAttrKeys extends string,
  ParsedData extends Record<WriteAttrKeys, unknown>,
  RequiredApiKeys extends string
> = {
  type: 'nest_request';
  api: RequiredApiKeys;
  parse: readonly [(raw: RawData) => ParsedData];
  fn: EffectFnWithDeps<RawData, any, Record<string, unknown>, string[], any[]>;
};

type ConsumeEffectDeclaration<RequiredApiKeys extends string, RequiredApis extends any[]> =
  | SubscribeEffectDeclaration<unknown, RequiredApiKeys, RequiredApis>
  | SubscribeWithShortActionEffectDeclaration<unknown, RequiredApiKeys, RequiredApis>
  | SubscribeWithFullActionEffectDeclaration<string, Record<string, unknown>, RequiredApiKeys, RequiredApis>
  | RequestStateEffectDeclaration<any, string, Record<string, unknown>, RequiredApiKeys>
  | RequestNestingEffectDeclaration<any, string, Record<string, unknown>, RequiredApiKeys>;
type ConsumeEffectsDeclarations = Readonly<Record<string, ConsumeEffectDeclaration<string, any[]>>>;

type ProduceEffectDeclaration<
  AttrKeys extends string,
  Triggers extends any[],
  RequiredApiKeys extends string,
  RequiredApis extends any[]
> = {
  api: RequiredApiKeys[];
  require: AttrKeys[];
  trigger: AttrKeys[];
  fn: (...api: RequiredApis) => void;
};
type ProduceEffectsDeclarations = Readonly<Record<string, ProduceEffectDeclaration<string, any[], string, any[]>>>;

type EffectsDeclarations = {
  api?: ApiDeclarations;
  consume?: ConsumeEffectsDeclarations;
  produce?: ProduceEffectsDeclarations;
};

type ModelDeclaration = {
  model_name?: string;
  extends?: typeof Model;
  attrs?: AttrsDeclarations;
  rels?: RelationsDeclarations;
  actions?: ActionsDeclarations;
  effects?: EffectsDeclarations;
};

export function getAttr<T>(model: Model, attrName: string): T;

export function updateAttr<T>(model: Model, attrName: string, newValue: T): void;

export function bhv(declaration: ModelDeclaration): typeof Model;

export function appRoot(constructor: typeof Model): Model;

type InputDefaultValues<T> = Record<string, T>;

export function inputAttrs<T>(defaultValues: InputDefaultValues<T>): AttrsDeclarations;

export const LoadableList: typeof Model;

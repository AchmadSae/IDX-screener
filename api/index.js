var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/server/http/ExpressContext.ts
function queryValue(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return void 0;
}
function createExpressContext(req, res) {
  return {
    request: new Request(`${req.protocol}://${req.get("host")}${req.originalUrl}`, {
      method: req.method,
      headers: req.headers
    }),
    pathname: req.path,
    requestId: String(res.locals.requestId ?? ""),
    body: req.body,
    query(name) {
      return queryValue(req.query[name]);
    },
    param(name) {
      return queryValue(req.params[name]);
    },
    send: {
      json(body, init) {
        res.status(init?.status ?? 200).json(body);
      },
      html(body, init) {
        res.status(init?.status ?? 200).type("html").send(body);
      }
    }
  };
}
var init_ExpressContext = __esm({
  "src/server/http/ExpressContext.ts"() {
  }
});

// src/server/http/errors.ts
function isApiError(error) {
  return error instanceof ApiError;
}
var ApiError;
var init_errors = __esm({
  "src/server/http/errors.ts"() {
    ApiError = class _ApiError extends Error {
      statusCode;
      code;
      constructor(statusCode, code, message) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
      }
      static badRequest(code, message) {
        return new _ApiError(400, code, message);
      }
      static notFound(code, message) {
        return new _ApiError(404, code, message);
      }
      static conflict(code, message) {
        return new _ApiError(409, code, message);
      }
      static tooManyRequests(code, message) {
        return new _ApiError(429, code, message);
      }
    };
  }
});

// src/server/routes/api/health.ts
function GET(ctx) {
  return ctx.send.json({
    ok: true,
    service: "idx-ui",
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    root: process.cwd()
  });
}
var init_health = __esm({
  "src/server/routes/api/health.ts"() {
  }
});

// node_modules/drizzle-orm/entity.js
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}
var entityKind;
var init_entity = __esm({
  "node_modules/drizzle-orm/entity.js"() {
    entityKind = /* @__PURE__ */ Symbol.for("drizzle:entityKind");
  }
});

// node_modules/drizzle-orm/column.js
var Column;
var init_column = __esm({
  "node_modules/drizzle-orm/column.js"() {
    init_entity();
    Column = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
        this.name = config.name;
        this.keyAsName = config.keyAsName;
        this.notNull = config.notNull;
        this.default = config.default;
        this.defaultFn = config.defaultFn;
        this.onUpdateFn = config.onUpdateFn;
        this.hasDefault = config.hasDefault;
        this.primary = config.primaryKey;
        this.isUnique = config.isUnique;
        this.uniqueName = config.uniqueName;
        this.uniqueType = config.uniqueType;
        this.dataType = config.dataType;
        this.columnType = config.columnType;
        this.generated = config.generated;
        this.generatedIdentity = config.generatedIdentity;
      }
      static [entityKind] = "Column";
      name;
      keyAsName;
      primary;
      notNull;
      default;
      defaultFn;
      onUpdateFn;
      hasDefault;
      isUnique;
      uniqueName;
      uniqueType;
      dataType;
      columnType;
      enumValues = void 0;
      generated = void 0;
      generatedIdentity = void 0;
      config;
      mapFromDriverValue(value) {
        return value;
      }
      mapToDriverValue(value) {
        return value;
      }
      // ** @internal */
      shouldDisableInsert() {
        return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
      }
    };
  }
});

// node_modules/drizzle-orm/column-builder.js
var ColumnBuilder;
var init_column_builder = __esm({
  "node_modules/drizzle-orm/column-builder.js"() {
    init_entity();
    ColumnBuilder = class {
      static [entityKind] = "ColumnBuilder";
      config;
      constructor(name, dataType, columnType) {
        this.config = {
          name,
          keyAsName: name === "",
          notNull: false,
          default: void 0,
          hasDefault: false,
          primaryKey: false,
          isUnique: false,
          uniqueName: void 0,
          uniqueType: void 0,
          dataType,
          columnType,
          generated: void 0
        };
      }
      /**
       * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
       *
       * @example
       * ```ts
       * const users = pgTable('users', {
       * 	id: integer('id').$type<UserId>().primaryKey(),
       * 	details: json('details').$type<UserDetails>().notNull(),
       * });
       * ```
       */
      $type() {
        return this;
      }
      /**
       * Adds a `not null` clause to the column definition.
       *
       * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
       */
      notNull() {
        this.config.notNull = true;
        return this;
      }
      /**
       * Adds a `default <value>` clause to the column definition.
       *
       * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
       *
       * If you need to set a dynamic default value, use {@link $defaultFn} instead.
       */
      default(value) {
        this.config.default = value;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Adds a dynamic default value to the column.
       * The function will be called when the row is inserted, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $defaultFn(fn) {
        this.config.defaultFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $defaultFn}.
       */
      $default = this.$defaultFn;
      /**
       * Adds a dynamic update value to the column.
       * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
       * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $onUpdateFn(fn) {
        this.config.onUpdateFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $onUpdateFn}.
       */
      $onUpdate = this.$onUpdateFn;
      /**
       * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
       *
       * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
       */
      primaryKey() {
        this.config.primaryKey = true;
        this.config.notNull = true;
        return this;
      }
      /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
      setName(name) {
        if (this.config.name !== "") return;
        this.config.name = name;
      }
    };
  }
});

// node_modules/drizzle-orm/table.utils.js
var TableName;
var init_table_utils = __esm({
  "node_modules/drizzle-orm/table.utils.js"() {
    TableName = /* @__PURE__ */ Symbol.for("drizzle:Name");
  }
});

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var ForeignKeyBuilder, ForeignKey;
var init_foreign_keys = __esm({
  "node_modules/drizzle-orm/pg-core/foreign-keys.js"() {
    init_entity();
    init_table_utils();
    ForeignKeyBuilder = class {
      static [entityKind] = "PgForeignKeyBuilder";
      /** @internal */
      reference;
      /** @internal */
      _onUpdate = "no action";
      /** @internal */
      _onDelete = "no action";
      constructor(config, actions) {
        this.reference = () => {
          const { name, columns, foreignColumns } = config();
          return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
        };
        if (actions) {
          this._onUpdate = actions.onUpdate;
          this._onDelete = actions.onDelete;
        }
      }
      onUpdate(action) {
        this._onUpdate = action === void 0 ? "no action" : action;
        return this;
      }
      onDelete(action) {
        this._onDelete = action === void 0 ? "no action" : action;
        return this;
      }
      /** @internal */
      build(table) {
        return new ForeignKey(table, this);
      }
    };
    ForeignKey = class {
      constructor(table, builder) {
        this.table = table;
        this.reference = builder.reference;
        this.onUpdate = builder._onUpdate;
        this.onDelete = builder._onDelete;
      }
      static [entityKind] = "PgForeignKey";
      reference;
      onUpdate;
      onDelete;
      getName() {
        const { name, columns, foreignColumns } = this.reference();
        const columnNames = columns.map((column) => column.name);
        const foreignColumnNames = foreignColumns.map((column) => column.name);
        const chunks = [
          this.table[TableName],
          ...columnNames,
          foreignColumns[0].table[TableName],
          ...foreignColumnNames
        ];
        return name ?? `${chunks.join("_")}_fk`;
      }
    };
  }
});

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}
var init_tracing_utils = __esm({
  "node_modules/drizzle-orm/tracing-utils.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder, UniqueOnConstraintBuilder, UniqueConstraint;
var init_unique_constraint = __esm({
  "node_modules/drizzle-orm/pg-core/unique-constraint.js"() {
    init_entity();
    init_table_utils();
    UniqueConstraintBuilder = class {
      constructor(columns, name) {
        this.name = name;
        this.columns = columns;
      }
      static [entityKind] = "PgUniqueConstraintBuilder";
      /** @internal */
      columns;
      /** @internal */
      nullsNotDistinctConfig = false;
      nullsNotDistinct() {
        this.nullsNotDistinctConfig = true;
        return this;
      }
      /** @internal */
      build(table) {
        return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
      }
    };
    UniqueOnConstraintBuilder = class {
      static [entityKind] = "PgUniqueOnConstraintBuilder";
      /** @internal */
      name;
      constructor(name) {
        this.name = name;
      }
      on(...columns) {
        return new UniqueConstraintBuilder(columns, this.name);
      }
    };
    UniqueConstraint = class {
      constructor(table, columns, nullsNotDistinct, name) {
        this.table = table;
        this.columns = columns;
        this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
        this.nullsNotDistinct = nullsNotDistinct;
      }
      static [entityKind] = "PgUniqueConstraint";
      columns;
      name;
      nullsNotDistinct = false;
      getName() {
        return this.name;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}
var init_array = __esm({
  "node_modules/drizzle-orm/pg-core/utils/array.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/columns/common.js
var PgColumnBuilder, PgColumn, ExtraConfigColumn, IndexedColumn, PgArrayBuilder, PgArray;
var init_common = __esm({
  "node_modules/drizzle-orm/pg-core/columns/common.js"() {
    init_column_builder();
    init_column();
    init_entity();
    init_foreign_keys();
    init_tracing_utils();
    init_unique_constraint();
    init_array();
    PgColumnBuilder = class extends ColumnBuilder {
      foreignKeyConfigs = [];
      static [entityKind] = "PgColumnBuilder";
      array(size2) {
        return new PgArrayBuilder(this.config.name, this, size2);
      }
      references(ref, actions = {}) {
        this.foreignKeyConfigs.push({ ref, actions });
        return this;
      }
      unique(name, config) {
        this.config.isUnique = true;
        this.config.uniqueName = name;
        this.config.uniqueType = config?.nulls;
        return this;
      }
      generatedAlwaysAs(as) {
        this.config.generated = {
          as,
          type: "always",
          mode: "stored"
        };
        return this;
      }
      /** @internal */
      buildForeignKeys(column, table) {
        return this.foreignKeyConfigs.map(({ ref, actions }) => {
          return iife(
            (ref2, actions2) => {
              const builder = new ForeignKeyBuilder(() => {
                const foreignColumn = ref2();
                return { columns: [column], foreignColumns: [foreignColumn] };
              });
              if (actions2.onUpdate) {
                builder.onUpdate(actions2.onUpdate);
              }
              if (actions2.onDelete) {
                builder.onDelete(actions2.onDelete);
              }
              return builder.build(table);
            },
            ref,
            actions
          );
        });
      }
      /** @internal */
      buildExtraConfigColumn(table) {
        return new ExtraConfigColumn(table, this.config);
      }
    };
    PgColumn = class extends Column {
      constructor(table, config) {
        if (!config.uniqueName) {
          config.uniqueName = uniqueKeyName(table, [config.name]);
        }
        super(table, config);
        this.table = table;
      }
      static [entityKind] = "PgColumn";
    };
    ExtraConfigColumn = class extends PgColumn {
      static [entityKind] = "ExtraConfigColumn";
      getSQLType() {
        return this.getSQLType();
      }
      indexConfig = {
        order: this.config.order ?? "asc",
        nulls: this.config.nulls ?? "last",
        opClass: this.config.opClass
      };
      defaultConfig = {
        order: "asc",
        nulls: "last",
        opClass: void 0
      };
      asc() {
        this.indexConfig.order = "asc";
        return this;
      }
      desc() {
        this.indexConfig.order = "desc";
        return this;
      }
      nullsFirst() {
        this.indexConfig.nulls = "first";
        return this;
      }
      nullsLast() {
        this.indexConfig.nulls = "last";
        return this;
      }
      /**
       * ### PostgreSQL documentation quote
       *
       * > An operator class with optional parameters can be specified for each column of an index.
       * The operator class identifies the operators to be used by the index for that column.
       * For example, a B-tree index on four-byte integers would use the int4_ops class;
       * this operator class includes comparison functions for four-byte integers.
       * In practice the default operator class for the column's data type is usually sufficient.
       * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
       * For example, we might want to sort a complex-number data type either by absolute value or by real part.
       * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
       * More information about operator classes check:
       *
       * ### Useful links
       * https://www.postgresql.org/docs/current/sql-createindex.html
       *
       * https://www.postgresql.org/docs/current/indexes-opclass.html
       *
       * https://www.postgresql.org/docs/current/xindex.html
       *
       * ### Additional types
       * If you have the `pg_vector` extension installed in your database, you can use the
       * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
       *
       * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
       *
       * @param opClass
       * @returns
       */
      op(opClass) {
        this.indexConfig.opClass = opClass;
        return this;
      }
    };
    IndexedColumn = class {
      static [entityKind] = "IndexedColumn";
      constructor(name, keyAsName, type, indexConfig) {
        this.name = name;
        this.keyAsName = keyAsName;
        this.type = type;
        this.indexConfig = indexConfig;
      }
      name;
      keyAsName;
      type;
      indexConfig;
    };
    PgArrayBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgArrayBuilder";
      constructor(name, baseBuilder, size2) {
        super(name, "array", "PgArray");
        this.config.baseBuilder = baseBuilder;
        this.config.size = size2;
      }
      /** @internal */
      build(table) {
        const baseColumn = this.config.baseBuilder.build(table);
        return new PgArray(
          table,
          this.config,
          baseColumn
        );
      }
    };
    PgArray = class _PgArray extends PgColumn {
      constructor(table, config, baseColumn, range) {
        super(table, config);
        this.baseColumn = baseColumn;
        this.range = range;
        this.size = config.size;
      }
      size;
      static [entityKind] = "PgArray";
      getSQLType() {
        return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          value = parsePgArray(value);
        }
        return value.map((v) => this.baseColumn.mapFromDriverValue(v));
      }
      mapToDriverValue(value, isNestedArray = false) {
        const a = value.map(
          (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
        );
        if (isNestedArray) return a;
        return makePgArray(a);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/enum.js
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
function pgEnumWithSchema(enumName, values2, schema) {
  const enumInstance = Object.assign(
    (name) => new PgEnumColumnBuilder(name ?? "", enumInstance),
    {
      enumName,
      enumValues: values2,
      schema,
      [isPgEnumSym]: true
    }
  );
  return enumInstance;
}
function pgEnumObjectWithSchema(enumName, values2, schema) {
  const enumInstance = Object.assign(
    (name) => new PgEnumObjectColumnBuilder(name ?? "", enumInstance),
    {
      enumName,
      enumValues: Object.values(values2),
      schema,
      [isPgEnumSym]: true
    }
  );
  return enumInstance;
}
var PgEnumObjectColumnBuilder, PgEnumObjectColumn, isPgEnumSym, PgEnumColumnBuilder, PgEnumColumn;
var init_enum = __esm({
  "node_modules/drizzle-orm/pg-core/columns/enum.js"() {
    init_entity();
    init_common();
    PgEnumObjectColumnBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgEnumObjectColumnBuilder";
      constructor(name, enumInstance) {
        super(name, "string", "PgEnumObjectColumn");
        this.config.enum = enumInstance;
      }
      /** @internal */
      build(table) {
        return new PgEnumObjectColumn(
          table,
          this.config
        );
      }
    };
    PgEnumObjectColumn = class extends PgColumn {
      static [entityKind] = "PgEnumObjectColumn";
      enum;
      enumValues = this.config.enum.enumValues;
      constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
      }
      getSQLType() {
        return this.enum.enumName;
      }
    };
    isPgEnumSym = /* @__PURE__ */ Symbol.for("drizzle:isPgEnum");
    PgEnumColumnBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgEnumColumnBuilder";
      constructor(name, enumInstance) {
        super(name, "string", "PgEnumColumn");
        this.config.enum = enumInstance;
      }
      /** @internal */
      build(table) {
        return new PgEnumColumn(
          table,
          this.config
        );
      }
    };
    PgEnumColumn = class extends PgColumn {
      static [entityKind] = "PgEnumColumn";
      enum = this.config.enum;
      enumValues = this.config.enum.enumValues;
      constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
      }
      getSQLType() {
        return this.enum.enumName;
      }
    };
  }
});

// node_modules/drizzle-orm/subquery.js
var Subquery, WithSubquery;
var init_subquery = __esm({
  "node_modules/drizzle-orm/subquery.js"() {
    init_entity();
    Subquery = class {
      static [entityKind] = "Subquery";
      constructor(sql2, fields, alias, isWith = false, usedTables = []) {
        this._ = {
          brand: "Subquery",
          sql: sql2,
          selectedFields: fields,
          alias,
          isWith,
          usedTables
        };
      }
      // getSQL(): SQL<unknown> {
      // 	return new SQL([this]);
      // }
    };
    WithSubquery = class extends Subquery {
      static [entityKind] = "WithSubquery";
    };
  }
});

// node_modules/drizzle-orm/version.js
var version;
var init_version = __esm({
  "node_modules/drizzle-orm/version.js"() {
    version = "0.45.2";
  }
});

// node_modules/drizzle-orm/tracing.js
var otel, rawTracer, tracer;
var init_tracing = __esm({
  "node_modules/drizzle-orm/tracing.js"() {
    init_tracing_utils();
    init_version();
    tracer = {
      startActiveSpan(name, fn) {
        if (!otel) {
          return fn();
        }
        if (!rawTracer) {
          rawTracer = otel.trace.getTracer("drizzle-orm", version);
        }
        return iife(
          (otel2, rawTracer2) => rawTracer2.startActiveSpan(
            name,
            (span) => {
              try {
                return fn(span);
              } catch (e) {
                span.setStatus({
                  code: otel2.SpanStatusCode.ERROR,
                  message: e instanceof Error ? e.message : "Unknown error"
                  // eslint-disable-line no-instanceof/no-instanceof
                });
                throw e;
              } finally {
                span.end();
              }
            }
          ),
          otel,
          rawTracer
        );
      }
    };
  }
});

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig;
var init_view_common = __esm({
  "node_modules/drizzle-orm/view-common.js"() {
    ViewBaseConfig = /* @__PURE__ */ Symbol.for("drizzle:ViewBaseConfig");
  }
});

// node_modules/drizzle-orm/table.js
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}
var Schema, Columns, ExtraConfigColumns, OriginalName, BaseName, IsAlias, ExtraConfigBuilder, IsDrizzleTable, Table;
var init_table = __esm({
  "node_modules/drizzle-orm/table.js"() {
    init_entity();
    init_table_utils();
    Schema = /* @__PURE__ */ Symbol.for("drizzle:Schema");
    Columns = /* @__PURE__ */ Symbol.for("drizzle:Columns");
    ExtraConfigColumns = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigColumns");
    OriginalName = /* @__PURE__ */ Symbol.for("drizzle:OriginalName");
    BaseName = /* @__PURE__ */ Symbol.for("drizzle:BaseName");
    IsAlias = /* @__PURE__ */ Symbol.for("drizzle:IsAlias");
    ExtraConfigBuilder = /* @__PURE__ */ Symbol.for("drizzle:ExtraConfigBuilder");
    IsDrizzleTable = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleTable");
    Table = class {
      static [entityKind] = "Table";
      /** @internal */
      static Symbol = {
        Name: TableName,
        Schema,
        OriginalName,
        Columns,
        ExtraConfigColumns,
        BaseName,
        IsAlias,
        ExtraConfigBuilder
      };
      /**
       * @internal
       * Can be changed if the table is aliased.
       */
      [TableName];
      /**
       * @internal
       * Used to store the original name of the table, before any aliasing.
       */
      [OriginalName];
      /** @internal */
      [Schema];
      /** @internal */
      [Columns];
      /** @internal */
      [ExtraConfigColumns];
      /**
       *  @internal
       * Used to store the table name before the transformation via the `tableCreator` functions.
       */
      [BaseName];
      /** @internal */
      [IsAlias] = false;
      /** @internal */
      [IsDrizzleTable] = true;
      /** @internal */
      [ExtraConfigBuilder] = void 0;
      constructor(name, schema, baseName) {
        this[TableName] = this[OriginalName] = name;
        this[Schema] = schema;
        this[BaseName] = baseName;
      }
    };
  }
});

// node_modules/drizzle-orm/sql/sql.js
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
function fillPlaceholders(params, values2) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values2)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values2[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values2)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values2[p.value.name]);
    }
    return p;
  });
}
var FakePrimitiveParam, StringChunk, SQL, Name, noopDecoder, noopEncoder, noopMapper, Param, Placeholder, IsDrizzleView, View;
var init_sql = __esm({
  "node_modules/drizzle-orm/sql/sql.js"() {
    init_entity();
    init_enum();
    init_subquery();
    init_tracing();
    init_view_common();
    init_column();
    init_table();
    FakePrimitiveParam = class {
      static [entityKind] = "FakePrimitiveParam";
    };
    StringChunk = class {
      static [entityKind] = "StringChunk";
      value;
      constructor(value) {
        this.value = Array.isArray(value) ? value : [value];
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    SQL = class _SQL {
      constructor(queryChunks) {
        this.queryChunks = queryChunks;
        for (const chunk of queryChunks) {
          if (is(chunk, Table)) {
            const schemaName = chunk[Table.Symbol.Schema];
            this.usedTables.push(
              schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
            );
          }
        }
      }
      static [entityKind] = "SQL";
      /** @internal */
      decoder = noopDecoder;
      shouldInlineParams = false;
      /** @internal */
      usedTables = [];
      append(query) {
        this.queryChunks.push(...query.queryChunks);
        return this;
      }
      toQuery(config) {
        return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
          const query = this.buildQueryFromSourceParams(this.queryChunks, config);
          span?.setAttributes({
            "drizzle.query.text": query.sql,
            "drizzle.query.params": JSON.stringify(query.params)
          });
          return query;
        });
      }
      buildQueryFromSourceParams(chunks, _config) {
        const config = Object.assign({}, _config, {
          inlineParams: _config.inlineParams || this.shouldInlineParams,
          paramStartIndex: _config.paramStartIndex || { value: 0 }
        });
        const {
          casing,
          escapeName,
          escapeParam,
          prepareTyping,
          inlineParams,
          paramStartIndex
        } = config;
        return mergeQueries(chunks.map((chunk) => {
          if (is(chunk, StringChunk)) {
            return { sql: chunk.value.join(""), params: [] };
          }
          if (is(chunk, Name)) {
            return { sql: escapeName(chunk.value), params: [] };
          }
          if (chunk === void 0) {
            return { sql: "", params: [] };
          }
          if (Array.isArray(chunk)) {
            const result = [new StringChunk("(")];
            for (const [i, p] of chunk.entries()) {
              result.push(p);
              if (i < chunk.length - 1) {
                result.push(new StringChunk(", "));
              }
            }
            result.push(new StringChunk(")"));
            return this.buildQueryFromSourceParams(result, config);
          }
          if (is(chunk, _SQL)) {
            return this.buildQueryFromSourceParams(chunk.queryChunks, {
              ...config,
              inlineParams: inlineParams || chunk.shouldInlineParams
            });
          }
          if (is(chunk, Table)) {
            const schemaName = chunk[Table.Symbol.Schema];
            const tableName = chunk[Table.Symbol.Name];
            return {
              sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
              params: []
            };
          }
          if (is(chunk, Column)) {
            const columnName = casing.getColumnCasing(chunk);
            if (_config.invokeSource === "indexes") {
              return { sql: escapeName(columnName), params: [] };
            }
            const schemaName = chunk.table[Table.Symbol.Schema];
            return {
              sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
              params: []
            };
          }
          if (is(chunk, View)) {
            const schemaName = chunk[ViewBaseConfig].schema;
            const viewName = chunk[ViewBaseConfig].name;
            return {
              sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
              params: []
            };
          }
          if (is(chunk, Param)) {
            if (is(chunk.value, Placeholder)) {
              return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
            }
            const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
            if (is(mappedValue, _SQL)) {
              return this.buildQueryFromSourceParams([mappedValue], config);
            }
            if (inlineParams) {
              return { sql: this.mapInlineParam(mappedValue, config), params: [] };
            }
            let typings = ["none"];
            if (prepareTyping) {
              typings = [prepareTyping(chunk.encoder)];
            }
            return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
          }
          if (is(chunk, Placeholder)) {
            return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
          }
          if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
            return { sql: escapeName(chunk.fieldAlias), params: [] };
          }
          if (is(chunk, Subquery)) {
            if (chunk._.isWith) {
              return { sql: escapeName(chunk._.alias), params: [] };
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk._.sql,
              new StringChunk(") "),
              new Name(chunk._.alias)
            ], config);
          }
          if (isPgEnum(chunk)) {
            if (chunk.schema) {
              return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
            }
            return { sql: escapeName(chunk.enumName), params: [] };
          }
          if (isSQLWrapper(chunk)) {
            if (chunk.shouldOmitSQLParens?.()) {
              return this.buildQueryFromSourceParams([chunk.getSQL()], config);
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk.getSQL(),
              new StringChunk(")")
            ], config);
          }
          if (inlineParams) {
            return { sql: this.mapInlineParam(chunk, config), params: [] };
          }
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }));
      }
      mapInlineParam(chunk, { escapeString }) {
        if (chunk === null) {
          return "null";
        }
        if (typeof chunk === "number" || typeof chunk === "boolean") {
          return chunk.toString();
        }
        if (typeof chunk === "string") {
          return escapeString(chunk);
        }
        if (typeof chunk === "object") {
          const mappedValueAsString = chunk.toString();
          if (mappedValueAsString === "[object Object]") {
            return escapeString(JSON.stringify(chunk));
          }
          return escapeString(mappedValueAsString);
        }
        throw new Error("Unexpected param value: " + chunk);
      }
      getSQL() {
        return this;
      }
      as(alias) {
        if (alias === void 0) {
          return this;
        }
        return new _SQL.Aliased(this, alias);
      }
      mapWith(decoder) {
        this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
        return this;
      }
      inlineParams() {
        this.shouldInlineParams = true;
        return this;
      }
      /**
       * This method is used to conditionally include a part of the query.
       *
       * @param condition - Condition to check
       * @returns itself if the condition is `true`, otherwise `undefined`
       */
      if(condition) {
        return condition ? this : void 0;
      }
    };
    Name = class {
      constructor(value) {
        this.value = value;
      }
      static [entityKind] = "Name";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    noopDecoder = {
      mapFromDriverValue: (value) => value
    };
    noopEncoder = {
      mapToDriverValue: (value) => value
    };
    noopMapper = {
      ...noopDecoder,
      ...noopEncoder
    };
    Param = class {
      /**
       * @param value - Parameter value
       * @param encoder - Encoder to convert the value to a driver parameter
       */
      constructor(value, encoder = noopEncoder) {
        this.value = value;
        this.encoder = encoder;
      }
      static [entityKind] = "Param";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    ((sql2) => {
      function empty() {
        return new SQL([]);
      }
      sql2.empty = empty;
      function fromList(list) {
        return new SQL(list);
      }
      sql2.fromList = fromList;
      function raw(str) {
        return new SQL([new StringChunk(str)]);
      }
      sql2.raw = raw;
      function join(chunks, separator) {
        const result = [];
        for (const [i, chunk] of chunks.entries()) {
          if (i > 0 && separator !== void 0) {
            result.push(separator);
          }
          result.push(chunk);
        }
        return new SQL(result);
      }
      sql2.join = join;
      function identifier(value) {
        return new Name(value);
      }
      sql2.identifier = identifier;
      function placeholder2(name2) {
        return new Placeholder(name2);
      }
      sql2.placeholder = placeholder2;
      function param2(value, encoder) {
        return new Param(value, encoder);
      }
      sql2.param = param2;
    })(sql || (sql = {}));
    ((SQL2) => {
      class Aliased {
        constructor(sql2, fieldAlias) {
          this.sql = sql2;
          this.fieldAlias = fieldAlias;
        }
        static [entityKind] = "SQL.Aliased";
        /** @internal */
        isSelectionField = false;
        getSQL() {
          return this.sql;
        }
        /** @internal */
        clone() {
          return new Aliased(this.sql, this.fieldAlias);
        }
      }
      SQL2.Aliased = Aliased;
    })(SQL || (SQL = {}));
    Placeholder = class {
      constructor(name2) {
        this.name = name2;
      }
      static [entityKind] = "Placeholder";
      getSQL() {
        return new SQL([this]);
      }
    };
    IsDrizzleView = /* @__PURE__ */ Symbol.for("drizzle:IsDrizzleView");
    View = class {
      static [entityKind] = "View";
      /** @internal */
      [ViewBaseConfig];
      /** @internal */
      [IsDrizzleView] = true;
      constructor({ name: name2, schema, selectedFields, query }) {
        this[ViewBaseConfig] = {
          name: name2,
          originalName: name2,
          schema,
          selectedFields,
          query,
          isExisting: !query,
          isAlias: false
        };
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    Column.prototype.getSQL = function() {
      return new SQL([this]);
    };
    Table.prototype.getSQL = function() {
      return new SQL([this]);
    };
    Subquery.prototype.getSQL = function() {
      return new SQL([this]);
    };
  }
});

// node_modules/drizzle-orm/alias.js
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}
var ColumnAliasProxyHandler, TableAliasProxyHandler, RelationTableAliasProxyHandler;
var init_alias = __esm({
  "node_modules/drizzle-orm/alias.js"() {
    init_column();
    init_entity();
    init_sql();
    init_table();
    init_view_common();
    ColumnAliasProxyHandler = class {
      constructor(table) {
        this.table = table;
      }
      static [entityKind] = "ColumnAliasProxyHandler";
      get(columnObj, prop) {
        if (prop === "table") {
          return this.table;
        }
        return columnObj[prop];
      }
    };
    TableAliasProxyHandler = class {
      constructor(alias, replaceOriginalName) {
        this.alias = alias;
        this.replaceOriginalName = replaceOriginalName;
      }
      static [entityKind] = "TableAliasProxyHandler";
      get(target, prop) {
        if (prop === Table.Symbol.IsAlias) {
          return true;
        }
        if (prop === Table.Symbol.Name) {
          return this.alias;
        }
        if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
          return this.alias;
        }
        if (prop === ViewBaseConfig) {
          return {
            ...target[ViewBaseConfig],
            name: this.alias,
            isAlias: true
          };
        }
        if (prop === Table.Symbol.Columns) {
          const columns = target[Table.Symbol.Columns];
          if (!columns) {
            return columns;
          }
          const proxiedColumns = {};
          Object.keys(columns).map((key) => {
            proxiedColumns[key] = new Proxy(
              columns[key],
              new ColumnAliasProxyHandler(new Proxy(target, this))
            );
          });
          return proxiedColumns;
        }
        const value = target[prop];
        if (is(value, Column)) {
          return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
        }
        return value;
      }
    };
    RelationTableAliasProxyHandler = class {
      constructor(alias) {
        this.alias = alias;
      }
      static [entityKind] = "RelationTableAliasProxyHandler";
      get(target, prop) {
        if (prop === "sourceTable") {
          return aliasedTable(target.sourceTable, this.alias);
        }
        return target[prop];
      }
    };
  }
});

// node_modules/drizzle-orm/errors.js
var DrizzleError, DrizzleQueryError, TransactionRollbackError;
var init_errors2 = __esm({
  "node_modules/drizzle-orm/errors.js"() {
    init_entity();
    DrizzleError = class extends Error {
      static [entityKind] = "DrizzleError";
      constructor({ message, cause }) {
        super(message);
        this.name = "DrizzleError";
        this.cause = cause;
      }
    };
    DrizzleQueryError = class _DrizzleQueryError extends Error {
      constructor(query, params, cause) {
        super(`Failed query: ${query}
params: ${params}`);
        this.query = query;
        this.params = params;
        this.cause = cause;
        Error.captureStackTrace(this, _DrizzleQueryError);
        if (cause) this.cause = cause;
      }
    };
    TransactionRollbackError = class extends DrizzleError {
      static [entityKind] = "TransactionRollbackError";
      constructor() {
        super({ message: "Rollback" });
      }
    };
  }
});

// node_modules/drizzle-orm/logger.js
var ConsoleLogWriter, DefaultLogger, NoopLogger;
var init_logger = __esm({
  "node_modules/drizzle-orm/logger.js"() {
    init_entity();
    ConsoleLogWriter = class {
      static [entityKind] = "ConsoleLogWriter";
      write(message) {
        console.log(message);
      }
    };
    DefaultLogger = class {
      static [entityKind] = "DefaultLogger";
      writer;
      constructor(config) {
        this.writer = config?.writer ?? new ConsoleLogWriter();
      }
      logQuery(query, params) {
        const stringifiedParams = params.map((p) => {
          try {
            return JSON.stringify(p);
          } catch {
            return String(p);
          }
        });
        const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
        this.writer.write(`Query: ${query}${paramsStr}`);
      }
    };
    NoopLogger = class {
      static [entityKind] = "NoopLogger";
      logQuery() {
      }
    };
  }
});

// node_modules/drizzle-orm/operations.js
var init_operations = __esm({
  "node_modules/drizzle-orm/operations.js"() {
  }
});

// node_modules/drizzle-orm/query-promise.js
var QueryPromise;
var init_query_promise = __esm({
  "node_modules/drizzle-orm/query-promise.js"() {
    init_entity();
    QueryPromise = class {
      static [entityKind] = "QueryPromise";
      [Symbol.toStringTag] = "QueryPromise";
      catch(onRejected) {
        return this.then(void 0, onRejected);
      }
      finally(onFinally) {
        return this.then(
          (value) => {
            onFinally?.();
            return value;
          },
          (reason) => {
            onFinally?.();
            throw reason;
          }
        );
      }
      then(onFulfilled, onRejected) {
        return this.execute().then(onFulfilled, onRejected);
      }
    };
  }
});

// node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else if (is(field, Subquery)) {
        decoder = field._.sql.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) || is(field, Subquery)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index2, key] of leftKeys.entries()) {
    if (key !== rightKeys[index2]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values2) {
  const entries = Object.entries(values2).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b2) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b2
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null) return false;
  if (data.constructor.name !== "Object") return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined") return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined") return false;
    return true;
  }
  if (Object.keys(data).length === 0) return true;
  return false;
}
var textDecoder;
var init_utils = __esm({
  "node_modules/drizzle-orm/utils.js"() {
    init_column();
    init_entity();
    init_sql();
    init_subquery();
    init_table();
    init_view_common();
    textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
  }
});

// node_modules/drizzle-orm/pg-core/columns/int.common.js
var PgIntColumnBaseBuilder;
var init_int_common = __esm({
  "node_modules/drizzle-orm/pg-core/columns/int.common.js"() {
    init_entity();
    init_common();
    PgIntColumnBaseBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgIntColumnBaseBuilder";
      generatedAlwaysAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "always",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "always"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
      generatedByDefaultAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "byDefault",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "byDefault"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigint.js
function bigint(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}
var PgBigInt53Builder, PgBigInt53, PgBigInt64Builder, PgBigInt64;
var init_bigint = __esm({
  "node_modules/drizzle-orm/pg-core/columns/bigint.js"() {
    init_entity();
    init_utils();
    init_common();
    init_int_common();
    PgBigInt53Builder = class extends PgIntColumnBaseBuilder {
      static [entityKind] = "PgBigInt53Builder";
      constructor(name) {
        super(name, "number", "PgBigInt53");
      }
      /** @internal */
      build(table) {
        return new PgBigInt53(table, this.config);
      }
    };
    PgBigInt53 = class extends PgColumn {
      static [entityKind] = "PgBigInt53";
      getSQLType() {
        return "bigint";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    PgBigInt64Builder = class extends PgIntColumnBaseBuilder {
      static [entityKind] = "PgBigInt64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigInt64");
      }
      /** @internal */
      build(table) {
        return new PgBigInt64(
          table,
          this.config
        );
      }
    };
    PgBigInt64 = class extends PgColumn {
      static [entityKind] = "PgBigInt64";
      getSQLType() {
        return "bigint";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigserial.js
function bigserial(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}
var PgBigSerial53Builder, PgBigSerial53, PgBigSerial64Builder, PgBigSerial64;
var init_bigserial = __esm({
  "node_modules/drizzle-orm/pg-core/columns/bigserial.js"() {
    init_entity();
    init_utils();
    init_common();
    PgBigSerial53Builder = class extends PgColumnBuilder {
      static [entityKind] = "PgBigSerial53Builder";
      constructor(name) {
        super(name, "number", "PgBigSerial53");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial53(
          table,
          this.config
        );
      }
    };
    PgBigSerial53 = class extends PgColumn {
      static [entityKind] = "PgBigSerial53";
      getSQLType() {
        return "bigserial";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    PgBigSerial64Builder = class extends PgColumnBuilder {
      static [entityKind] = "PgBigSerial64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigSerial64");
        this.config.hasDefault = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial64(
          table,
          this.config
        );
      }
    };
    PgBigSerial64 = class extends PgColumn {
      static [entityKind] = "PgBigSerial64";
      getSQLType() {
        return "bigserial";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/boolean.js
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}
var PgBooleanBuilder, PgBoolean;
var init_boolean = __esm({
  "node_modules/drizzle-orm/pg-core/columns/boolean.js"() {
    init_entity();
    init_common();
    PgBooleanBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgBooleanBuilder";
      constructor(name) {
        super(name, "boolean", "PgBoolean");
      }
      /** @internal */
      build(table) {
        return new PgBoolean(table, this.config);
      }
    };
    PgBoolean = class extends PgColumn {
      static [entityKind] = "PgBoolean";
      getSQLType() {
        return "boolean";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/char.js
function char(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgCharBuilder(name, config);
}
var PgCharBuilder, PgChar;
var init_char = __esm({
  "node_modules/drizzle-orm/pg-core/columns/char.js"() {
    init_entity();
    init_utils();
    init_common();
    PgCharBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgCharBuilder";
      constructor(name, config) {
        super(name, "string", "PgChar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgChar(
          table,
          this.config
        );
      }
    };
    PgChar = class extends PgColumn {
      static [entityKind] = "PgChar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `char` : `char(${this.length})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/cidr.js
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}
var PgCidrBuilder, PgCidr;
var init_cidr = __esm({
  "node_modules/drizzle-orm/pg-core/columns/cidr.js"() {
    init_entity();
    init_common();
    PgCidrBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgCidrBuilder";
      constructor(name) {
        super(name, "string", "PgCidr");
      }
      /** @internal */
      build(table) {
        return new PgCidr(table, this.config);
      }
    };
    PgCidr = class extends PgColumn {
      static [entityKind] = "PgCidr";
      getSQLType() {
        return "cidr";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/custom.js
function customType(customTypeParams) {
  return (a, b2) => {
    const { name, config } = getColumnNameAndConfig(a, b2);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}
var PgCustomColumnBuilder, PgCustomColumn;
var init_custom = __esm({
  "node_modules/drizzle-orm/pg-core/columns/custom.js"() {
    init_entity();
    init_utils();
    init_common();
    PgCustomColumnBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgCustomColumnBuilder";
      constructor(name, fieldConfig, customTypeParams) {
        super(name, "custom", "PgCustomColumn");
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
      }
      /** @internal */
      build(table) {
        return new PgCustomColumn(
          table,
          this.config
        );
      }
    };
    PgCustomColumn = class extends PgColumn {
      static [entityKind] = "PgCustomColumn";
      sqlName;
      mapTo;
      mapFrom;
      constructor(table, config) {
        super(table, config);
        this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
        this.mapTo = config.customTypeParams.toDriver;
        this.mapFrom = config.customTypeParams.fromDriver;
      }
      getSQLType() {
        return this.sqlName;
      }
      mapFromDriverValue(value) {
        return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
      }
      mapToDriverValue(value) {
        return typeof this.mapTo === "function" ? this.mapTo(value) : value;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.common.js
var PgDateColumnBaseBuilder;
var init_date_common = __esm({
  "node_modules/drizzle-orm/pg-core/columns/date.common.js"() {
    init_entity();
    init_sql();
    init_common();
    PgDateColumnBaseBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgDateColumnBaseBuilder";
      defaultNow() {
        return this.default(sql`now()`);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.js
function date(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}
var PgDateBuilder, PgDate, PgDateStringBuilder, PgDateString;
var init_date = __esm({
  "node_modules/drizzle-orm/pg-core/columns/date.js"() {
    init_entity();
    init_utils();
    init_common();
    init_date_common();
    PgDateBuilder = class extends PgDateColumnBaseBuilder {
      static [entityKind] = "PgDateBuilder";
      constructor(name) {
        super(name, "date", "PgDate");
      }
      /** @internal */
      build(table) {
        return new PgDate(table, this.config);
      }
    };
    PgDate = class extends PgColumn {
      static [entityKind] = "PgDate";
      getSQLType() {
        return "date";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return new Date(value);
        return value;
      }
      mapToDriverValue(value) {
        return value.toISOString();
      }
    };
    PgDateStringBuilder = class extends PgDateColumnBaseBuilder {
      static [entityKind] = "PgDateStringBuilder";
      constructor(name) {
        super(name, "string", "PgDateString");
      }
      /** @internal */
      build(table) {
        return new PgDateString(
          table,
          this.config
        );
      }
    };
    PgDateString = class extends PgColumn {
      static [entityKind] = "PgDateString";
      getSQLType() {
        return "date";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        return value.toISOString().slice(0, -14);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/double-precision.js
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}
var PgDoublePrecisionBuilder, PgDoublePrecision;
var init_double_precision = __esm({
  "node_modules/drizzle-orm/pg-core/columns/double-precision.js"() {
    init_entity();
    init_common();
    PgDoublePrecisionBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgDoublePrecisionBuilder";
      constructor(name) {
        super(name, "number", "PgDoublePrecision");
      }
      /** @internal */
      build(table) {
        return new PgDoublePrecision(
          table,
          this.config
        );
      }
    };
    PgDoublePrecision = class extends PgColumn {
      static [entityKind] = "PgDoublePrecision";
      getSQLType() {
        return "double precision";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/inet.js
function inet(name) {
  return new PgInetBuilder(name ?? "");
}
var PgInetBuilder, PgInet;
var init_inet = __esm({
  "node_modules/drizzle-orm/pg-core/columns/inet.js"() {
    init_entity();
    init_common();
    PgInetBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgInetBuilder";
      constructor(name) {
        super(name, "string", "PgInet");
      }
      /** @internal */
      build(table) {
        return new PgInet(table, this.config);
      }
    };
    PgInet = class extends PgColumn {
      static [entityKind] = "PgInet";
      getSQLType() {
        return "inet";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/integer.js
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}
var PgIntegerBuilder, PgInteger;
var init_integer = __esm({
  "node_modules/drizzle-orm/pg-core/columns/integer.js"() {
    init_entity();
    init_common();
    init_int_common();
    PgIntegerBuilder = class extends PgIntColumnBaseBuilder {
      static [entityKind] = "PgIntegerBuilder";
      constructor(name) {
        super(name, "number", "PgInteger");
      }
      /** @internal */
      build(table) {
        return new PgInteger(table, this.config);
      }
    };
    PgInteger = class extends PgColumn {
      static [entityKind] = "PgInteger";
      getSQLType() {
        return "integer";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseInt(value);
        }
        return value;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/interval.js
function interval(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgIntervalBuilder(name, config);
}
var PgIntervalBuilder, PgInterval;
var init_interval = __esm({
  "node_modules/drizzle-orm/pg-core/columns/interval.js"() {
    init_entity();
    init_utils();
    init_common();
    PgIntervalBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgIntervalBuilder";
      constructor(name, intervalConfig) {
        super(name, "string", "PgInterval");
        this.config.intervalConfig = intervalConfig;
      }
      /** @internal */
      build(table) {
        return new PgInterval(table, this.config);
      }
    };
    PgInterval = class extends PgColumn {
      static [entityKind] = "PgInterval";
      fields = this.config.intervalConfig.fields;
      precision = this.config.intervalConfig.precision;
      getSQLType() {
        const fields = this.fields ? ` ${this.fields}` : "";
        const precision = this.precision ? `(${this.precision})` : "";
        return `interval${fields}${precision}`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/json.js
function json(name) {
  return new PgJsonBuilder(name ?? "");
}
var PgJsonBuilder, PgJson;
var init_json = __esm({
  "node_modules/drizzle-orm/pg-core/columns/json.js"() {
    init_entity();
    init_common();
    PgJsonBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgJsonBuilder";
      constructor(name) {
        super(name, "json", "PgJson");
      }
      /** @internal */
      build(table) {
        return new PgJson(table, this.config);
      }
    };
    PgJson = class extends PgColumn {
      static [entityKind] = "PgJson";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "json";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/jsonb.js
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}
var PgJsonbBuilder, PgJsonb;
var init_jsonb = __esm({
  "node_modules/drizzle-orm/pg-core/columns/jsonb.js"() {
    init_entity();
    init_common();
    PgJsonbBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgJsonbBuilder";
      constructor(name) {
        super(name, "json", "PgJsonb");
      }
      /** @internal */
      build(table) {
        return new PgJsonb(table, this.config);
      }
    };
    PgJsonb = class extends PgColumn {
      static [entityKind] = "PgJsonb";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "jsonb";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/line.js
function line(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}
var PgLineBuilder, PgLineTuple, PgLineABCBuilder, PgLineABC;
var init_line = __esm({
  "node_modules/drizzle-orm/pg-core/columns/line.js"() {
    init_entity();
    init_utils();
    init_common();
    PgLineBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgLineBuilder";
      constructor(name) {
        super(name, "array", "PgLine");
      }
      /** @internal */
      build(table) {
        return new PgLineTuple(
          table,
          this.config
        );
      }
    };
    PgLineTuple = class extends PgColumn {
      static [entityKind] = "PgLine";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b2, c] = value.slice(1, -1).split(",");
        return [Number.parseFloat(a), Number.parseFloat(b2), Number.parseFloat(c)];
      }
      mapToDriverValue(value) {
        return `{${value[0]},${value[1]},${value[2]}}`;
      }
    };
    PgLineABCBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgLineABCBuilder";
      constructor(name) {
        super(name, "json", "PgLineABC");
      }
      /** @internal */
      build(table) {
        return new PgLineABC(
          table,
          this.config
        );
      }
    };
    PgLineABC = class extends PgColumn {
      static [entityKind] = "PgLineABC";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b2, c] = value.slice(1, -1).split(",");
        return { a: Number.parseFloat(a), b: Number.parseFloat(b2), c: Number.parseFloat(c) };
      }
      mapToDriverValue(value) {
        return `{${value.a},${value.b},${value.c}}`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr.js
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}
var PgMacaddrBuilder, PgMacaddr;
var init_macaddr = __esm({
  "node_modules/drizzle-orm/pg-core/columns/macaddr.js"() {
    init_entity();
    init_common();
    PgMacaddrBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgMacaddrBuilder";
      constructor(name) {
        super(name, "string", "PgMacaddr");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr(table, this.config);
      }
    };
    PgMacaddr = class extends PgColumn {
      static [entityKind] = "PgMacaddr";
      getSQLType() {
        return "macaddr";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr8.js
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}
var PgMacaddr8Builder, PgMacaddr8;
var init_macaddr8 = __esm({
  "node_modules/drizzle-orm/pg-core/columns/macaddr8.js"() {
    init_entity();
    init_common();
    PgMacaddr8Builder = class extends PgColumnBuilder {
      static [entityKind] = "PgMacaddr8Builder";
      constructor(name) {
        super(name, "string", "PgMacaddr8");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr8(table, this.config);
      }
    };
    PgMacaddr8 = class extends PgColumn {
      static [entityKind] = "PgMacaddr8";
      getSQLType() {
        return "macaddr8";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/numeric.js
function numeric(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  const mode = config?.mode;
  return mode === "number" ? new PgNumericNumberBuilder(name, config?.precision, config?.scale) : mode === "bigint" ? new PgNumericBigIntBuilder(name, config?.precision, config?.scale) : new PgNumericBuilder(name, config?.precision, config?.scale);
}
var PgNumericBuilder, PgNumeric, PgNumericNumberBuilder, PgNumericNumber, PgNumericBigIntBuilder, PgNumericBigInt;
var init_numeric = __esm({
  "node_modules/drizzle-orm/pg-core/columns/numeric.js"() {
    init_entity();
    init_utils();
    init_common();
    PgNumericBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgNumericBuilder";
      constructor(name, precision, scale) {
        super(name, "string", "PgNumeric");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumeric(table, this.config);
      }
    };
    PgNumeric = class extends PgColumn {
      static [entityKind] = "PgNumeric";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        return String(value);
      }
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    PgNumericNumberBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgNumericNumberBuilder";
      constructor(name, precision, scale) {
        super(name, "number", "PgNumericNumber");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumericNumber(
          table,
          this.config
        );
      }
    };
    PgNumericNumber = class extends PgColumn {
      static [entityKind] = "PgNumericNumber";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") return value;
        return Number(value);
      }
      mapToDriverValue = String;
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    PgNumericBigIntBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgNumericBigIntBuilder";
      constructor(name, precision, scale) {
        super(name, "bigint", "PgNumericBigInt");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumericBigInt(
          table,
          this.config
        );
      }
    };
    PgNumericBigInt = class extends PgColumn {
      static [entityKind] = "PgNumericBigInt";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      mapFromDriverValue = BigInt;
      mapToDriverValue = String;
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/point.js
function point(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}
var PgPointTupleBuilder, PgPointTuple, PgPointObjectBuilder, PgPointObject;
var init_point = __esm({
  "node_modules/drizzle-orm/pg-core/columns/point.js"() {
    init_entity();
    init_utils();
    init_common();
    PgPointTupleBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgPointTupleBuilder";
      constructor(name) {
        super(name, "array", "PgPointTuple");
      }
      /** @internal */
      build(table) {
        return new PgPointTuple(
          table,
          this.config
        );
      }
    };
    PgPointTuple = class extends PgColumn {
      static [entityKind] = "PgPointTuple";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return [Number.parseFloat(x), Number.parseFloat(y)];
        }
        return [value.x, value.y];
      }
      mapToDriverValue(value) {
        return `(${value[0]},${value[1]})`;
      }
    };
    PgPointObjectBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgPointObjectBuilder";
      constructor(name) {
        super(name, "json", "PgPointObject");
      }
      /** @internal */
      build(table) {
        return new PgPointObject(
          table,
          this.config
        );
      }
    };
    PgPointObject = class extends PgColumn {
      static [entityKind] = "PgPointObject";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
        }
        return value;
      }
      mapToDriverValue(value) {
        return `(${value.x},${value.y})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer2 = new ArrayBuffer(8);
  const view = new DataView(buffer2);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x = bytesToFloat64(bytes, offset);
    offset += 8;
    const y = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x, y];
  }
  throw new Error("Unsupported geometry type");
}
var init_utils2 = __esm({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js
function geometry(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}
var PgGeometryBuilder, PgGeometry, PgGeometryObjectBuilder, PgGeometryObject;
var init_geometry = __esm({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js"() {
    init_entity();
    init_utils();
    init_common();
    init_utils2();
    PgGeometryBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgGeometryBuilder";
      constructor(name) {
        super(name, "array", "PgGeometry");
      }
      /** @internal */
      build(table) {
        return new PgGeometry(
          table,
          this.config
        );
      }
    };
    PgGeometry = class extends PgColumn {
      static [entityKind] = "PgGeometry";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        return parseEWKB(value);
      }
      mapToDriverValue(value) {
        return `point(${value[0]} ${value[1]})`;
      }
    };
    PgGeometryObjectBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgGeometryObjectBuilder";
      constructor(name) {
        super(name, "json", "PgGeometryObject");
      }
      /** @internal */
      build(table) {
        return new PgGeometryObject(
          table,
          this.config
        );
      }
    };
    PgGeometryObject = class extends PgColumn {
      static [entityKind] = "PgGeometryObject";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        const parsed = parseEWKB(value);
        return { x: parsed[0], y: parsed[1] };
      }
      mapToDriverValue(value) {
        return `point(${value.x} ${value.y})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/real.js
function real(name) {
  return new PgRealBuilder(name ?? "");
}
var PgRealBuilder, PgReal;
var init_real = __esm({
  "node_modules/drizzle-orm/pg-core/columns/real.js"() {
    init_entity();
    init_common();
    PgRealBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgRealBuilder";
      constructor(name, length) {
        super(name, "number", "PgReal");
        this.config.length = length;
      }
      /** @internal */
      build(table) {
        return new PgReal(table, this.config);
      }
    };
    PgReal = class extends PgColumn {
      static [entityKind] = "PgReal";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "real";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      };
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/serial.js
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}
var PgSerialBuilder, PgSerial;
var init_serial = __esm({
  "node_modules/drizzle-orm/pg-core/columns/serial.js"() {
    init_entity();
    init_common();
    PgSerialBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSerial(table, this.config);
      }
    };
    PgSerial = class extends PgColumn {
      static [entityKind] = "PgSerial";
      getSQLType() {
        return "serial";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallint.js
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}
var PgSmallIntBuilder, PgSmallInt;
var init_smallint = __esm({
  "node_modules/drizzle-orm/pg-core/columns/smallint.js"() {
    init_entity();
    init_common();
    init_int_common();
    PgSmallIntBuilder = class extends PgIntColumnBaseBuilder {
      static [entityKind] = "PgSmallIntBuilder";
      constructor(name) {
        super(name, "number", "PgSmallInt");
      }
      /** @internal */
      build(table) {
        return new PgSmallInt(table, this.config);
      }
    };
    PgSmallInt = class extends PgColumn {
      static [entityKind] = "PgSmallInt";
      getSQLType() {
        return "smallint";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number(value);
        }
        return value;
      };
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallserial.js
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}
var PgSmallSerialBuilder, PgSmallSerial;
var init_smallserial = __esm({
  "node_modules/drizzle-orm/pg-core/columns/smallserial.js"() {
    init_entity();
    init_common();
    PgSmallSerialBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgSmallSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSmallSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSmallSerial(
          table,
          this.config
        );
      }
    };
    PgSmallSerial = class extends PgColumn {
      static [entityKind] = "PgSmallSerial";
      getSQLType() {
        return "smallserial";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/text.js
function text(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgTextBuilder(name, config);
}
var PgTextBuilder, PgText;
var init_text = __esm({
  "node_modules/drizzle-orm/pg-core/columns/text.js"() {
    init_entity();
    init_utils();
    init_common();
    PgTextBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgTextBuilder";
      constructor(name, config) {
        super(name, "string", "PgText");
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgText(table, this.config);
      }
    };
    PgText = class extends PgColumn {
      static [entityKind] = "PgText";
      enumValues = this.config.enumValues;
      getSQLType() {
        return "text";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/time.js
function time(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}
var PgTimeBuilder, PgTime;
var init_time = __esm({
  "node_modules/drizzle-orm/pg-core/columns/time.js"() {
    init_entity();
    init_utils();
    init_common();
    init_date_common();
    PgTimeBuilder = class extends PgDateColumnBaseBuilder {
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTime");
        this.withTimezone = withTimezone;
        this.precision = precision;
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      static [entityKind] = "PgTimeBuilder";
      /** @internal */
      build(table) {
        return new PgTime(table, this.config);
      }
    };
    PgTime = class extends PgColumn {
      static [entityKind] = "PgTime";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/timestamp.js
function timestamp(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}
var PgTimestampBuilder, PgTimestamp, PgTimestampStringBuilder, PgTimestampString;
var init_timestamp = __esm({
  "node_modules/drizzle-orm/pg-core/columns/timestamp.js"() {
    init_entity();
    init_utils();
    init_common();
    init_date_common();
    PgTimestampBuilder = class extends PgDateColumnBaseBuilder {
      static [entityKind] = "PgTimestampBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "date", "PgTimestamp");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestamp(table, this.config);
      }
    };
    PgTimestamp = class extends PgColumn {
      static [entityKind] = "PgTimestamp";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return new Date(this.withTimezone ? value : value + "+0000");
        return value;
      }
      mapToDriverValue = (value) => {
        return value.toISOString();
      };
    };
    PgTimestampStringBuilder = class extends PgDateColumnBaseBuilder {
      static [entityKind] = "PgTimestampStringBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTimestampString");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestampString(
          table,
          this.config
        );
      }
    };
    PgTimestampString = class extends PgColumn {
      static [entityKind] = "PgTimestampString";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") return value;
        const shortened = value.toISOString().slice(0, -1).replace("T", " ");
        if (this.withTimezone) {
          const offset = value.getTimezoneOffset();
          const sign = offset <= 0 ? "+" : "-";
          return `${shortened}${sign}${Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")}`;
        }
        return shortened;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/uuid.js
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}
var PgUUIDBuilder, PgUUID;
var init_uuid = __esm({
  "node_modules/drizzle-orm/pg-core/columns/uuid.js"() {
    init_entity();
    init_sql();
    init_common();
    PgUUIDBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgUUIDBuilder";
      constructor(name) {
        super(name, "string", "PgUUID");
      }
      /**
       * Adds `default gen_random_uuid()` to the column definition.
       */
      defaultRandom() {
        return this.default(sql`gen_random_uuid()`);
      }
      /** @internal */
      build(table) {
        return new PgUUID(table, this.config);
      }
    };
    PgUUID = class extends PgColumn {
      static [entityKind] = "PgUUID";
      getSQLType() {
        return "uuid";
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/varchar.js
function varchar(a, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgVarcharBuilder(name, config);
}
var PgVarcharBuilder, PgVarchar;
var init_varchar = __esm({
  "node_modules/drizzle-orm/pg-core/columns/varchar.js"() {
    init_entity();
    init_utils();
    init_common();
    PgVarcharBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgVarcharBuilder";
      constructor(name, config) {
        super(name, "string", "PgVarchar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgVarchar(
          table,
          this.config
        );
      }
    };
    PgVarchar = class extends PgColumn {
      static [entityKind] = "PgVarchar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js
function bit(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgBinaryVectorBuilder(name, config);
}
var PgBinaryVectorBuilder, PgBinaryVector;
var init_bit = __esm({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js"() {
    init_entity();
    init_utils();
    init_common();
    PgBinaryVectorBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgBinaryVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgBinaryVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgBinaryVector(
          table,
          this.config
        );
      }
    };
    PgBinaryVector = class extends PgColumn {
      static [entityKind] = "PgBinaryVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `bit(${this.dimensions})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js
function halfvec(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgHalfVectorBuilder(name, config);
}
var PgHalfVectorBuilder, PgHalfVector;
var init_halfvec = __esm({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js"() {
    init_entity();
    init_utils();
    init_common();
    PgHalfVectorBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgHalfVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgHalfVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgHalfVector(
          table,
          this.config
        );
      }
    };
    PgHalfVector = class extends PgColumn {
      static [entityKind] = "PgHalfVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `halfvec(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js
function sparsevec(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgSparseVectorBuilder(name, config);
}
var PgSparseVectorBuilder, PgSparseVector;
var init_sparsevec = __esm({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js"() {
    init_entity();
    init_utils();
    init_common();
    PgSparseVectorBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgSparseVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgSparseVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgSparseVector(
          table,
          this.config
        );
      }
    };
    PgSparseVector = class extends PgColumn {
      static [entityKind] = "PgSparseVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `sparsevec(${this.dimensions})`;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js
function vector(a, b2) {
  const { name, config } = getColumnNameAndConfig(a, b2);
  return new PgVectorBuilder(name, config);
}
var PgVectorBuilder, PgVector;
var init_vector = __esm({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js"() {
    init_entity();
    init_utils();
    init_common();
    PgVectorBuilder = class extends PgColumnBuilder {
      static [entityKind] = "PgVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgVector(
          table,
          this.config
        );
      }
    };
    PgVector = class extends PgColumn {
      static [entityKind] = "PgVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `vector(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/all.js
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}
var init_all = __esm({
  "node_modules/drizzle-orm/pg-core/columns/all.js"() {
    init_bigint();
    init_bigserial();
    init_boolean();
    init_char();
    init_cidr();
    init_custom();
    init_date();
    init_double_precision();
    init_inet();
    init_integer();
    init_interval();
    init_json();
    init_jsonb();
    init_line();
    init_macaddr();
    init_macaddr8();
    init_numeric();
    init_point();
    init_geometry();
    init_real();
    init_serial();
    init_smallint();
    init_smallserial();
    init_text();
    init_time();
    init_timestamp();
    init_uuid();
    init_varchar();
    init_bit();
    init_halfvec();
    init_sparsevec();
    init_vector();
  }
});

// node_modules/drizzle-orm/pg-core/table.js
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
var InlineForeignKeys, EnableRLS, PgTable, pgTable;
var init_table2 = __esm({
  "node_modules/drizzle-orm/pg-core/table.js"() {
    init_entity();
    init_table();
    init_all();
    InlineForeignKeys = /* @__PURE__ */ Symbol.for("drizzle:PgInlineForeignKeys");
    EnableRLS = /* @__PURE__ */ Symbol.for("drizzle:EnableRLS");
    PgTable = class extends Table {
      static [entityKind] = "PgTable";
      /** @internal */
      static Symbol = Object.assign({}, Table.Symbol, {
        InlineForeignKeys,
        EnableRLS
      });
      /**@internal */
      [InlineForeignKeys] = [];
      /** @internal */
      [EnableRLS] = false;
      /** @internal */
      [Table.Symbol.ExtraConfigBuilder] = void 0;
      /** @internal */
      [Table.Symbol.ExtraConfigColumns] = {};
    };
    pgTable = (name, columns, extraConfig) => {
      return pgTableWithSchema(name, columns, extraConfig, void 0);
    };
  }
});

// node_modules/drizzle-orm/pg-core/primary-keys.js
var PrimaryKeyBuilder, PrimaryKey;
var init_primary_keys = __esm({
  "node_modules/drizzle-orm/pg-core/primary-keys.js"() {
    init_entity();
    init_table2();
    PrimaryKeyBuilder = class {
      static [entityKind] = "PgPrimaryKeyBuilder";
      /** @internal */
      columns;
      /** @internal */
      name;
      constructor(columns, name) {
        this.columns = columns;
        this.name = name;
      }
      /** @internal */
      build(table) {
        return new PrimaryKey(table, this.columns, this.name);
      }
    };
    PrimaryKey = class {
      constructor(table, columns, name) {
        this.table = table;
        this.columns = columns;
        this.name = name;
      }
      static [entityKind] = "PgPrimaryKey";
      columns;
      name;
      getName() {
        return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
      }
    };
  }
});

// node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
function inArray(column, values2) {
  if (Array.isArray(values2)) {
    if (values2.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values2.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values2, column)}`;
}
function notInArray(column, values2) {
  if (Array.isArray(values2)) {
    if (values2.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values2.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values2, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}
var eq, ne, gt, gte, lt, lte;
var init_conditions = __esm({
  "node_modules/drizzle-orm/sql/expressions/conditions.js"() {
    init_column();
    init_entity();
    init_table();
    init_sql();
    eq = (left, right) => {
      return sql`${left} = ${bindIfParam(right, left)}`;
    };
    ne = (left, right) => {
      return sql`${left} <> ${bindIfParam(right, left)}`;
    };
    gt = (left, right) => {
      return sql`${left} > ${bindIfParam(right, left)}`;
    };
    gte = (left, right) => {
      return sql`${left} >= ${bindIfParam(right, left)}`;
    };
    lt = (left, right) => {
      return sql`${left} < ${bindIfParam(right, left)}`;
    };
    lte = (left, right) => {
      return sql`${left} <= ${bindIfParam(right, left)}`;
    };
  }
});

// node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}
var init_select = __esm({
  "node_modules/drizzle-orm/sql/expressions/select.js"() {
    init_sql();
  }
});

// node_modules/drizzle-orm/sql/expressions/index.js
var init_expressions = __esm({
  "node_modules/drizzle-orm/sql/expressions/index.js"() {
    init_conditions();
    init_select();
  }
});

// node_modules/drizzle-orm/relations.js
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey) {
            tableConfig.primaryKey.push(...primaryKey);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}
var Relation, Relations, One, Many;
var init_relations = __esm({
  "node_modules/drizzle-orm/relations.js"() {
    init_table();
    init_column();
    init_entity();
    init_primary_keys();
    init_expressions();
    init_sql();
    Relation = class {
      constructor(sourceTable, referencedTable, relationName) {
        this.sourceTable = sourceTable;
        this.referencedTable = referencedTable;
        this.relationName = relationName;
        this.referencedTableName = referencedTable[Table.Symbol.Name];
      }
      static [entityKind] = "Relation";
      referencedTableName;
      fieldName;
    };
    Relations = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
      }
      static [entityKind] = "Relations";
    };
    One = class _One extends Relation {
      constructor(sourceTable, referencedTable, config, isNullable) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
        this.isNullable = isNullable;
      }
      static [entityKind] = "One";
      withFieldName(fieldName) {
        const relation = new _One(
          this.sourceTable,
          this.referencedTable,
          this.config,
          this.isNullable
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
    Many = class _Many extends Relation {
      constructor(sourceTable, referencedTable, config) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
      }
      static [entityKind] = "Many";
      withFieldName(fieldName) {
        const relation = new _Many(
          this.sourceTable,
          this.referencedTable,
          this.config
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
  }
});

// node_modules/drizzle-orm/sql/functions/aggregate.js
function count(expression) {
  return sql`count(${expression || sql.raw("*")})`.mapWith(Number);
}
var init_aggregate = __esm({
  "node_modules/drizzle-orm/sql/functions/aggregate.js"() {
    init_sql();
  }
});

// node_modules/drizzle-orm/sql/functions/vector.js
var init_vector2 = __esm({
  "node_modules/drizzle-orm/sql/functions/vector.js"() {
  }
});

// node_modules/drizzle-orm/sql/functions/index.js
var init_functions = __esm({
  "node_modules/drizzle-orm/sql/functions/index.js"() {
    init_aggregate();
    init_vector2();
  }
});

// node_modules/drizzle-orm/sql/index.js
var init_sql2 = __esm({
  "node_modules/drizzle-orm/sql/index.js"() {
    init_expressions();
    init_functions();
    init_sql();
  }
});

// node_modules/drizzle-orm/index.js
var init_drizzle_orm = __esm({
  "node_modules/drizzle-orm/index.js"() {
    init_alias();
    init_column_builder();
    init_column();
    init_entity();
    init_errors2();
    init_logger();
    init_operations();
    init_query_promise();
    init_relations();
    init_sql2();
    init_subquery();
    init_table();
    init_utils();
    init_view_common();
  }
});

// node_modules/postgres/src/query.js
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}
var originCache, originStackCache, originError, CLOSE, Query;
var init_query = __esm({
  "node_modules/postgres/src/query.js"() {
    originCache = /* @__PURE__ */ new Map();
    originStackCache = /* @__PURE__ */ new Map();
    originError = /* @__PURE__ */ Symbol("OriginError");
    CLOSE = {};
    Query = class extends Promise {
      constructor(strings, args, handler2, canceller, options = {}) {
        let resolve, reject;
        super((a, b2) => {
          resolve = a;
          reject = b2;
        });
        this.tagged = Array.isArray(strings.raw);
        this.strings = strings;
        this.args = args;
        this.handler = handler2;
        this.canceller = canceller;
        this.options = options;
        this.state = null;
        this.statement = null;
        this.resolve = (x) => (this.active = false, resolve(x));
        this.reject = (x) => (this.active = false, reject(x));
        this.active = false;
        this.cancelled = null;
        this.executed = false;
        this.signature = "";
        this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
      }
      get origin() {
        return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || "";
      }
      static get [Symbol.species]() {
        return Promise;
      }
      cancel() {
        return this.canceller && (this.canceller(this), this.canceller = null);
      }
      simple() {
        this.options.simple = true;
        this.options.prepare = false;
        return this;
      }
      async readable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      async writable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      cursor(rows = 1, fn) {
        this.options.simple = false;
        if (typeof rows === "function") {
          fn = rows;
          rows = 1;
        }
        this.cursorRows = rows;
        if (typeof fn === "function")
          return this.cursorFn = fn, this;
        let prev;
        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              if (this.executed && !this.active)
                return { done: true };
              prev && prev();
              const promise = new Promise((resolve, reject) => {
                this.cursorFn = (value) => {
                  resolve({ value, done: false });
                  return new Promise((r) => prev = r);
                };
                this.resolve = () => (this.active = false, resolve({ done: true }));
                this.reject = (x) => (this.active = false, reject(x));
              });
              this.execute();
              return promise;
            },
            return() {
              prev && prev(CLOSE);
              return { done: true };
            }
          })
        };
      }
      describe() {
        this.options.simple = false;
        this.onlyDescribe = this.options.prepare = true;
        return this;
      }
      stream() {
        throw new Error(".stream has been renamed to .forEach");
      }
      forEach(fn) {
        this.forEachFn = fn;
        this.handle();
        return this;
      }
      raw() {
        this.isRaw = true;
        return this;
      }
      values() {
        this.isRaw = "values";
        return this;
      }
      async handle() {
        !this.executed && (this.executed = true) && await 1 && this.handler(this);
      }
      execute() {
        this.handle();
        return this;
      }
      then() {
        this.handle();
        return super.then.apply(this, arguments);
      }
      catch() {
        this.handle();
        return super.catch.apply(this, arguments);
      }
      finally() {
        this.handle();
        return super.finally.apply(this, arguments);
      }
    };
  }
});

// node_modules/postgres/src/errors.js
function connection(x, options, socket) {
  const { host, port } = socket || options;
  const error = Object.assign(
    new Error("write " + x + " " + (options.path || host + ":" + port)),
    {
      code: x,
      errno: x,
      address: options.path || host
    },
    options.path ? {} : { port }
  );
  Error.captureStackTrace(error, connection);
  return error;
}
function postgres(x) {
  const error = new PostgresError(x);
  Error.captureStackTrace(error, postgres);
  return error;
}
function generic(code, message) {
  const error = Object.assign(new Error(code + ": " + message), { code });
  Error.captureStackTrace(error, generic);
  return error;
}
function notSupported(x) {
  const error = Object.assign(
    new Error(x + " (B) is not supported"),
    {
      code: "MESSAGE_NOT_SUPPORTED",
      name: x
    }
  );
  Error.captureStackTrace(error, notSupported);
  return error;
}
var PostgresError, Errors;
var init_errors3 = __esm({
  "node_modules/postgres/src/errors.js"() {
    PostgresError = class extends Error {
      constructor(x) {
        super(x.message);
        this.name = this.constructor.name;
        Object.assign(this, x);
      }
    };
    Errors = {
      connection,
      postgres,
      generic,
      notSupported
    };
  }
});

// node_modules/postgres/src/types.js
function handleValue(x, parameters, types2, options) {
  let value = x instanceof Parameter ? x.value : x;
  if (value === void 0) {
    x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
    if (value === void 0)
      throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
  }
  return "$" + types2.push(
    x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
  );
}
function stringify(q, string, value, parameters, types2, options) {
  for (let i = 1; i < q.strings.length; i++) {
    string += stringifyValue(string, value, parameters, types2, options) + q.strings[i];
    value = q.args[i];
  }
  return string;
}
function stringifyValue(string, value, parameters, types2, o) {
  return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
}
function fragment(q, parameters, types2, options) {
  q.fragment = true;
  return stringify(q, q.strings[0], q.args[0], parameters, types2, options);
}
function valuesBuilder(first, parameters, types2, columns, options) {
  return first.map(
    (row) => "(" + columns.map(
      (column) => stringifyValue("values", row[column], parameters, types2, options)
    ).join(",") + ")"
  ).join(",");
}
function values(first, rest, parameters, types2, options) {
  const multi = Array.isArray(first[0]);
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
  return valuesBuilder(multi ? first : [first], parameters, types2, columns, options);
}
function select(first, rest, parameters, types2, options) {
  typeof first === "string" && (first = [first].concat(rest));
  if (Array.isArray(first))
    return escapeIdentifiers(first, options);
  let value;
  const columns = rest.length ? rest.flat() : Object.keys(first);
  return columns.map((x) => {
    value = first[x];
    return (value instanceof Query ? fragment(value, parameters, types2, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options)) + " as " + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
  }).join(",");
}
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
function typeHandlers(types2) {
  return Object.keys(types2).reduce((acc, k) => {
    types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
    if (types2[k].serialize) {
      acc.serializers[types2[k].to] = types2[k].serialize;
      types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
    }
    return acc;
  }, { parsers: {}, serializers: {} });
}
function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
}
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
function arrayParserLoop(s, x, parser, typarray) {
  const xs = [];
  const delimiter = typarray === 1020 ? ";" : ",";
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i];
    if (s.quoted) {
      if (s.char === "\\") {
        s.str += x[++s.i];
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str);
        s.str = "";
        s.quoted = x[s.i + 1] === '"';
        s.last = s.i + 2;
      } else {
        s.str += s.char;
      }
    } else if (s.char === '"') {
      s.quoted = true;
    } else if (s.char === "{") {
      s.last = ++s.i;
      xs.push(arrayParserLoop(s, x, parser, typarray));
    } else if (s.char === "}") {
      s.quoted = false;
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
      break;
    } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
    }
    s.p = s.char;
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
  return xs;
}
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
var types, NotTagged, Identifier, Parameter, Builder, defaultHandlers, builders, serializers, parsers, mergeUserTypes, escapeIdentifier, inferType, escapeBackslash, escapeQuote, arraySerializer, arrayParserState, arrayParser, toCamel, toPascal, toKebab, fromCamel, fromPascal, fromKebab, camel, pascal, kebab;
var init_types = __esm({
  "node_modules/postgres/src/types.js"() {
    init_query();
    init_errors3();
    types = {
      string: {
        to: 25,
        from: null,
        // defaults to string
        serialize: (x) => "" + x
      },
      number: {
        to: 0,
        from: [21, 23, 26, 700, 701],
        serialize: (x) => "" + x,
        parse: (x) => +x
      },
      json: {
        to: 114,
        from: [114, 3802],
        serialize: (x) => JSON.stringify(x),
        parse: (x) => JSON.parse(x)
      },
      boolean: {
        to: 16,
        from: 16,
        serialize: (x) => x === true ? "t" : "f",
        parse: (x) => x === "t"
      },
      date: {
        to: 1184,
        from: [1082, 1114, 1184],
        serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
        parse: (x) => new Date(x)
      },
      bytea: {
        to: 17,
        from: 17,
        serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
        parse: (x) => Buffer.from(x.slice(2), "hex")
      }
    };
    NotTagged = class {
      then() {
        notTagged();
      }
      catch() {
        notTagged();
      }
      finally() {
        notTagged();
      }
    };
    Identifier = class extends NotTagged {
      constructor(value) {
        super();
        this.value = escapeIdentifier(value);
      }
    };
    Parameter = class extends NotTagged {
      constructor(value, type, array) {
        super();
        this.value = value;
        this.type = type;
        this.array = array;
      }
    };
    Builder = class extends NotTagged {
      constructor(first, rest) {
        super();
        this.first = first;
        this.rest = rest;
      }
      build(before, parameters, types2, options) {
        const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b2) => a.i - b2.i).pop();
        return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types2, options);
      }
    };
    defaultHandlers = typeHandlers(types);
    builders = Object.entries({
      values,
      in: (...xs) => {
        const x = values(...xs);
        return x === "()" ? "(null)" : x;
      },
      select,
      as: select,
      returning: select,
      "\\(": select,
      update(first, rest, parameters, types2, options) {
        return (rest.length ? rest.flat() : Object.keys(first)).map(
          (x) => escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options)
        );
      },
      insert(first, rest, parameters, types2, options) {
        const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
        return "(" + escapeIdentifiers(columns, options) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options);
      }
    }).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
    serializers = defaultHandlers.serializers;
    parsers = defaultHandlers.parsers;
    mergeUserTypes = function(types2) {
      const user = typeHandlers(types2 || {});
      return {
        serializers: Object.assign({}, serializers, user.serializers),
        parsers: Object.assign({}, parsers, user.parsers)
      };
    };
    escapeIdentifier = function escape(str) {
      return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
    };
    inferType = function inferType2(x) {
      return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
    };
    escapeBackslash = /\\/g;
    escapeQuote = /"/g;
    arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
      if (Array.isArray(xs) === false)
        return xs;
      if (!xs.length)
        return "{}";
      const first = xs[0];
      const delimiter = typarray === 1020 ? ";" : ",";
      if (Array.isArray(first) && !first.type)
        return "{" + xs.map((x) => arraySerializer2(x, serializer, options, typarray)).join(delimiter) + "}";
      return "{" + xs.map((x) => {
        if (x === void 0) {
          x = options.transform.undefined;
          if (x === void 0)
            throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
        }
        return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
      }).join(delimiter) + "}";
    };
    arrayParserState = {
      i: 0,
      char: null,
      str: "",
      quoted: false,
      last: 0
    };
    arrayParser = function arrayParser2(x, parser, typarray) {
      arrayParserState.i = arrayParserState.last = 0;
      return arrayParserLoop(arrayParserState, x, parser, typarray);
    };
    toCamel = (x) => {
      let str = x[0];
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    toPascal = (x) => {
      let str = x[0].toUpperCase();
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    toKebab = (x) => x.replace(/_/g, "-");
    fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
    fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
    fromKebab = (x) => x.replace(/-/g, "_");
    toCamel.column = { from: toCamel };
    toCamel.value = { from: createJsonTransform(toCamel) };
    fromCamel.column = { to: fromCamel };
    camel = { ...toCamel };
    camel.column.to = fromCamel;
    toPascal.column = { from: toPascal };
    toPascal.value = { from: createJsonTransform(toPascal) };
    fromPascal.column = { to: fromPascal };
    pascal = { ...toPascal };
    pascal.column.to = fromPascal;
    toKebab.column = { from: toKebab };
    toKebab.value = { from: createJsonTransform(toKebab) };
    fromKebab.column = { to: fromKebab };
    kebab = { ...toKebab };
    kebab.column.to = fromKebab;
  }
});

// node_modules/postgres/src/result.js
var Result;
var init_result = __esm({
  "node_modules/postgres/src/result.js"() {
    Result = class extends Array {
      constructor() {
        super();
        Object.defineProperties(this, {
          count: { value: null, writable: true },
          state: { value: null, writable: true },
          command: { value: null, writable: true },
          columns: { value: null, writable: true },
          statement: { value: null, writable: true }
        });
      }
      static get [Symbol.species]() {
        return Array;
      }
    };
  }
});

// node_modules/postgres/src/queue.js
function Queue(initial = []) {
  let xs = initial.slice();
  let index2 = 0;
  return {
    get length() {
      return xs.length - index2;
    },
    remove: (x) => {
      const index3 = xs.indexOf(x);
      return index3 === -1 ? null : (xs.splice(index3, 1), x);
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index2++];
      if (index2 === xs.length) {
        index2 = 0;
        xs = [];
      } else {
        xs[index2 - 1] = void 0;
      }
      return out;
    }
  };
}
var queue_default;
var init_queue = __esm({
  "node_modules/postgres/src/queue.js"() {
    queue_default = Queue;
  }
});

// node_modules/postgres/src/bytes.js
function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer, length = prev.length;
    buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
    prev.copy(buffer);
  }
}
function reset() {
  b.i = 0;
  return b;
}
var size, buffer, messages, b, bytes_default;
var init_bytes = __esm({
  "node_modules/postgres/src/bytes.js"() {
    size = 256;
    buffer = Buffer.allocUnsafe(size);
    messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
      const v = x.charCodeAt(0);
      acc[x] = () => {
        buffer[0] = v;
        b.i = 5;
        return b;
      };
      return acc;
    }, {});
    b = Object.assign(reset, messages, {
      N: String.fromCharCode(0),
      i: 0,
      inc(x) {
        b.i += x;
        return b;
      },
      str(x) {
        const length = Buffer.byteLength(x);
        fit(length);
        b.i += buffer.write(x, b.i, length, "utf8");
        return b;
      },
      i16(x) {
        fit(2);
        buffer.writeUInt16BE(x, b.i);
        b.i += 2;
        return b;
      },
      i32(x, i) {
        if (i || i === 0) {
          buffer.writeUInt32BE(x, i);
          return b;
        }
        fit(4);
        buffer.writeUInt32BE(x, b.i);
        b.i += 4;
        return b;
      },
      z(x) {
        fit(x);
        buffer.fill(0, b.i, b.i + x);
        b.i += x;
        return b;
      },
      raw(x) {
        buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
        b.i = buffer.length;
        return b;
      },
      end(at = 1) {
        buffer.writeUInt32BE(b.i - at, at);
        const out = buffer.subarray(0, b.i);
        b.i = 0;
        buffer = Buffer.allocUnsafe(size);
        return out;
      }
    });
    bytes_default = b;
  }
});

// node_modules/postgres/src/connection.js
import net from "net";
import tls from "tls";
import crypto2 from "crypto";
import Stream from "stream";
import { performance } from "perf_hooks";
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    sslnegotiation,
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers: parsers2,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff: backoff2,
    target_session_attrs
  } = options;
  const sent = queue_default(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
  let socket = null, cancelMessage, errorResponse = null, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
  const connection2 = {
    queue: queues.closed,
    idleTimer,
    connect(query2) {
      initial = query2;
      reconnect();
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  };
  queues.closed && queues.closed.push(connection2);
  return connection2;
  async function createSocket() {
    let x;
    try {
      x = options.socket ? await Promise.resolve(options.socket(options)) : new net.Socket();
    } catch (e) {
      error(e);
      return;
    }
    x.on("error", error);
    x.on("close", closed);
    x.on("drain", drain);
    return x;
  }
  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes_default().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
      await connect();
      socket.once("error", reject);
      socket.once("close", resolve);
    } catch (error2) {
      reject(error2);
    }
  }
  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection("CONNECTION_DESTROYED", options));
    if (stream)
      return queryError(q, Errors.generic("COPY_IN_PROGRESS", "You cannot execute queries during copy"));
    if (q.cancelled)
      return;
    try {
      q.state = backend;
      query ? sent.push(q) : (query = q, query.active = true);
      build(q);
      return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection2));
    } catch (error2) {
      sent.length === 0 && write(Sync);
      errored(error2);
      return true;
    }
  }
  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
    return q.options.simple ? bytes_default().Q().str(q.statement.string + bytes_default.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
  }
  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe("S", q.statement.name)
    ]);
  }
  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
    ]);
  }
  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ]);
  }
  function build(q) {
    const parameters = [], types2 = [];
    const string = stringify(q, q.strings[0], q.args[0], parameters, types2, options);
    !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types2, options));
    q.prepare = options.prepare && ("prepare" in q.options ? q.options.prepare : true);
    q.string = string;
    q.signature = q.prepare && types2 + string;
    q.onlyDescribe && delete statements[q.signature];
    q.parameters = q.parameters || parameters;
    q.prepared = q.prepare && q.signature in statements;
    q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
    q.statement = q.prepared ? statements[q.signature] : { string, types: types2, name: q.prepare ? statementId + statementCount++ : "" };
    typeof options.debug === "function" && options.debug(id, string, parameters, types2);
  }
  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
    if (fn || chunk.length >= 1024)
      return nextWrite(fn);
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
    return true;
  }
  function nextWrite(fn) {
    const x = socket.write(chunk, fn);
    nextWriteTimer !== null && clearImmediate(nextWriteTimer);
    chunk = nextWriteTimer = null;
    return x;
  }
  function connectTimedOut() {
    errored(Errors.connection("CONNECT_TIMEOUT", options, socket));
    socket.destroy();
  }
  async function secure() {
    if (sslnegotiation !== "direct") {
      write(SSLRequest);
      const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
      if (!canSSL && ssl === "prefer")
        return connected();
    }
    const options2 = {
      socket,
      servername: net.isIP(socket.host) ? void 0 : socket.host
    };
    if (sslnegotiation === "direct")
      options2.ALPNProtocols = ["postgresql"];
    if (ssl === "require" || ssl === "allow" || ssl === "prefer")
      options2.rejectUnauthorized = false;
    else if (typeof ssl === "object")
      Object.assign(options2, ssl);
    socket.removeAllListeners();
    socket = tls.connect(options2);
    socket.on("secureConnect", connected);
    socket.on("error", error);
    socket.on("close", closed);
    socket.on("drain", drain);
  }
  function drain() {
    !query && onopen(connection2);
  }
  function data(x) {
    if (incomings) {
      incomings.push(x);
      remaining -= x.length;
      if (remaining > 0)
        return;
    }
    incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1);
      if (length >= incoming.length) {
        remaining = length - incoming.length;
        incomings = [incoming];
        break;
      }
      try {
        handle(incoming.subarray(0, length + 1));
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        errored(e);
      }
      incoming = incoming.subarray(length + 1);
      remaining = 0;
      incomings = null;
    }
  }
  async function connect() {
    terminated = false;
    backendParameters = {};
    socket || (socket = await createSocket());
    if (!socket)
      return;
    connectTimer.start();
    if (options.socket)
      return ssl ? secure() : connected();
    socket.on("connect", ssl ? secure : connected);
    if (options.path)
      return socket.connect(options.path);
    socket.ssl = ssl;
    socket.connect(port[hostIndex], host[hostIndex]);
    socket.host = host[hostIndex];
    socket.port = port[hostIndex];
    hostIndex = (hostIndex + 1) % port.length;
  }
  function reconnect() {
    setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - performance.now()) : 0);
  }
  function connected() {
    try {
      statements = {};
      needsTypes = options.fetch_types;
      statementId = Math.random().toString(36).slice(2);
      statementCount = 1;
      lifeTimer.start();
      socket.on("data", data);
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
      const s = StartupMessage();
      write(s);
    } catch (err) {
      error(err);
    }
  }
  function error(err) {
    if (connection2.queue === queues.connecting && options.host[retries + 1])
      return;
    errored(err);
    while (sent.length)
      queryError(sent.shift(), err);
  }
  function errored(err) {
    stream && (stream.destroy(err), stream = null);
    query && queryError(query, err);
    initial && (queryError(initial, err), initial = null);
  }
  function queryError(query2, err) {
    if (query2.reserve)
      return query2.reject(err);
    if (!err || typeof err !== "object")
      err = new Error(err);
    "query" in err || "parameters" in err || Object.defineProperties(err, {
      stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options.debug },
      query: { value: query2.string, enumerable: options.debug },
      parameters: { value: query2.parameters, enumerable: options.debug },
      args: { value: query2.args, enumerable: options.debug },
      types: { value: query2.statement && query2.statement.types, enumerable: options.debug }
    });
    query2.reject(err);
  }
  function end() {
    return ending || (!connection2.reserved && onend(connection2), !connection2.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
  }
  function terminate() {
    terminated = true;
    if (stream || query || initial || sent.length)
      error(Errors.connection("CONNECTION_DESTROYED", options));
    clearImmediate(nextWriteTimer);
    if (socket) {
      socket.removeListener("data", data);
      socket.removeListener("connect", connected);
      socket.readyState === "open" && socket.end(bytes_default().X().end());
    }
    ended && (ended(), ending = ended = null);
  }
  async function closed(hadError) {
    incoming = Buffer.alloc(0);
    remaining = 0;
    incomings = null;
    clearImmediate(nextWriteTimer);
    socket.removeListener("data", data);
    socket.removeListener("connect", connected);
    idleTimer.cancel();
    lifeTimer.cancel();
    connectTimer.cancel();
    socket.removeAllListeners();
    socket = null;
    if (initial)
      return reconnect();
    !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options, socket));
    closedTime = performance.now();
    hadError && options.shared.retries++;
    delay = (typeof backoff2 === "function" ? backoff2(options.shared.retries) : backoff2) * 1e3;
    onclose(connection2, Errors.connection("CONNECTION_CLOSED", options, socket));
  }
  function handle(xs, x = xs[0]) {
    (x === 68 ? DataRow : (
      // D
      x === 100 ? CopyData : (
        // d
        x === 65 ? NotificationResponse : (
          // A
          x === 83 ? ParameterStatus : (
            // S
            x === 90 ? ReadyForQuery : (
              // Z
              x === 67 ? CommandComplete : (
                // C
                x === 50 ? BindComplete : (
                  // 2
                  x === 49 ? ParseComplete : (
                    // 1
                    x === 116 ? ParameterDescription : (
                      // t
                      x === 84 ? RowDescription : (
                        // T
                        x === 82 ? Authentication : (
                          // R
                          x === 110 ? NoData : (
                            // n
                            x === 75 ? BackendKeyData : (
                              // K
                              x === 69 ? ErrorResponse : (
                                // E
                                x === 115 ? PortalSuspended : (
                                  // s
                                  x === 51 ? CloseComplete : (
                                    // 3
                                    x === 71 ? CopyInResponse : (
                                      // G
                                      x === 78 ? NoticeResponse : (
                                        // N
                                        x === 72 ? CopyOutResponse : (
                                          // H
                                          x === 99 ? CopyDone : (
                                            // c
                                            x === 73 ? EmptyQueryResponse : (
                                              // I
                                              x === 86 ? FunctionCallResponse : (
                                                // V
                                                x === 118 ? NegotiateProtocolVersion : (
                                                  // v
                                                  x === 87 ? CopyBothResponse : (
                                                    // W
                                                    /* c8 ignore next */
                                                    UnknownMessage
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))(xs);
  }
  function DataRow(x) {
    let index2 = 7;
    let length2;
    let column;
    let value;
    const row = query.isRaw ? new Array(query.statement.columns.length) : {};
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i];
      length2 = x.readInt32BE(index2);
      index2 += 4;
      value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index2, index2 += length2) : column.parser === void 0 ? x.toString("utf8", index2, index2 += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index2 + 1, index2 += length2)) : column.parser(x.toString("utf8", index2, index2 += length2));
      query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
  }
  function ParameterStatus(x) {
    const [k, v] = x.toString("utf8", 5, x.length - 1).split(bytes_default.N);
    backendParameters[k] = v;
    if (options.parameters[k] !== v) {
      options.parameters[k] = v;
      onparameter && onparameter(k, v);
    }
  }
  function ReadyForQuery(x) {
    if (query) {
      if (errorResponse) {
        query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse.routine) ? retry(query, errorResponse) : errored(errorResponse);
      } else {
        query.resolve(results || result);
      }
    } else if (errorResponse) {
      errored(errorResponse);
    }
    query = results = errorResponse = null;
    result = new Result();
    connectTimer.cancel();
    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState();
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate();
      }
      if (needsTypes) {
        initial.reserve && (initial = null);
        return fetchArrayTypes();
      }
      initial && !initial.reserve && execute(initial);
      options.shared.retries = retries = 0;
      initial = null;
      return;
    }
    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
    if (query)
      return;
    connection2.reserved ? !connection2.reserved.release && x[5] === 73 ? ending ? terminate() : (connection2.reserved = null, onopen(connection2)) : connection2.reserved() : ending ? terminate() : onopen(connection2);
  }
  function CommandComplete(x) {
    rows = 0;
    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString("utf8", i + 1, x.length - 1);
      if (x[i - 1] >= 65) {
        result.command = x.toString("utf8", 5, i);
        result.state = backend;
        break;
      }
    }
    final && (final(), final = null);
    if (result.command === "BEGIN" && max !== 1 && !connection2.reserved)
      return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin, sql.reserved or max: 1"));
    if (query.options.simple)
      return BindComplete();
    if (query.cursorFn) {
      result.count && query.cursorFn(result);
      write(Sync);
    }
  }
  function ParseComplete() {
    query.parsing = false;
  }
  function BindComplete() {
    !result.statement && (result.statement = query.statement);
    result.columns = query.statement.columns;
  }
  function ParameterDescription(x) {
    const length2 = x.readUInt16BE(5);
    for (let i = 0; i < length2; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
    query.prepare && (statements[query.signature] = query.statement);
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
  }
  function RowDescription(x) {
    if (result.command) {
      results = results || [result];
      results.push(result = new Result());
      result.count = null;
      query.statement.columns = null;
    }
    const length2 = x.readUInt16BE(5);
    let index2 = 7;
    let start;
    query.statement.columns = Array(length2);
    for (let i = 0; i < length2; ++i) {
      start = index2;
      while (x[index2++] !== 0) ;
      const table = x.readUInt32BE(index2);
      const number = x.readUInt16BE(index2 + 4);
      const type = x.readUInt32BE(index2 + 6);
      query.statement.columns[i] = {
        name: transform.column.from ? transform.column.from(x.toString("utf8", start, index2 - 1)) : x.toString("utf8", start, index2 - 1),
        parser: parsers2[type],
        table,
        number,
        type
      };
      index2 += 18;
    }
    result.statement = query.statement;
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  async function Authentication(x, type = x.readUInt32BE(5)) {
    (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
  }
  async function AuthenticationCleartextPassword() {
    const payload = await Pass();
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function AuthenticationMD5Password(x) {
    const payload = "md5" + await md5(
      Buffer.concat([
        Buffer.from(await md5(await Pass() + user)),
        x.subarray(9)
      ])
    );
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function SASL() {
    nonce = (await crypto2.randomBytes(18)).toString("base64");
    bytes_default().p().str("SCRAM-SHA-256" + bytes_default.N);
    const i = bytes_default.i;
    write(bytes_default.inc(4).str("n,,n=*,r=" + nonce).i32(bytes_default.i - i - 4, i).end());
  }
  async function SASLContinue(x) {
    const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
    const saltedPassword = await crypto2.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, "base64"),
      parseInt(res.i),
      32,
      "sha256"
    );
    const clientKey = await hmac(saltedPassword, "Client Key");
    const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
    serverSignature = (await hmac(await hmac(saltedPassword, "Server Key"), auth)).toString("base64");
    const payload = "c=biws,r=" + res.r + ",p=" + xor(
      clientKey,
      Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString("base64");
    write(
      bytes_default().p().str(payload).end()
    );
  }
  function SASLFinal(x) {
    if (x.toString("utf8", 9).split(bytes_default.N, 1)[0].slice(2) === serverSignature)
      return;
    errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
    socket.destroy();
  }
  function Pass() {
    return Promise.resolve(
      typeof options.pass === "function" ? options.pass() : options.pass
    );
  }
  function NoData() {
    result.statement = query.statement;
    result.statement.columns = [];
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5);
    backend.secret = x.readUInt32BE(9);
  }
  async function fetchArrayTypes() {
    needsTypes = false;
    const types2 = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
    types2.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
  }
  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
    const parser = options.parsers[oid];
    options.shared.typeArrayMap[oid] = typarray;
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray);
    options.parsers[typarray].array = true;
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray);
  }
  function tryNext(x, xs) {
    return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options.host[retries];
  }
  function fetchState() {
    const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
    query2.resolve = ([[a], [b2]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only;
      backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
    };
    query2.execute();
  }
  function ErrorResponse(x) {
    if (query) {
      (query.cursorFn || query.describeFirst) && write(Sync);
      errorResponse = Errors.postgres(parseError(x));
    } else {
      errored(Errors.postgres(parseError(x)));
    }
  }
  function retry(q, error2) {
    delete statements[q.signature];
    q.retried = error2;
    execute(q);
  }
  function NotificationResponse(x) {
    if (!onnotify)
      return;
    let index2 = 9;
    while (x[index2++] !== 0) ;
    onnotify(
      x.toString("utf8", 9, index2 - 1),
      x.toString("utf8", index2, x.length - 1)
    );
  }
  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result));
      rows = 0;
      x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
    } catch (err) {
      write(Sync);
      query.reject(err);
    }
  }
  function CloseComplete() {
    result.count && query.cursorFn(result);
    query.resolve(result);
  }
  function CopyInResponse() {
    stream = new Stream.Writable({
      autoDestroy: true,
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
        stream = null;
      }
    });
    query.resolve(stream);
  }
  function CopyOutResponse() {
    stream = new Stream.Readable({
      read() {
        socket.resume();
      }
    });
    query.resolve(stream);
  }
  function CopyBothResponse() {
    stream = new Stream.Duplex({
      autoDestroy: true,
      read() {
        socket.resume();
      },
      /* c8 ignore next 11 */
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
      }
    });
    query.resolve(stream);
  }
  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause());
  }
  function CopyDone() {
    stream && stream.push(null);
    stream = null;
  }
  function NoticeResponse(x) {
    onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
  }
  function EmptyQueryResponse() {
  }
  function FunctionCallResponse() {
    errored(Errors.notSupported("FunctionCallResponse"));
  }
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported("NegotiateProtocolVersion"));
  }
  function UnknownMessage(x) {
    console.error("Postgres.js : Unknown Message:", x[0]);
  }
  function UnknownAuth(x, type) {
    console.error("Postgres.js : Unknown Auth:", type);
  }
  function Bind(parameters, types2, statement = "", portal = "") {
    let prev, type;
    bytes_default().B().str(portal + bytes_default.N).str(statement + bytes_default.N).i16(0).i16(parameters.length);
    parameters.forEach((x, i) => {
      if (x === null)
        return bytes_default.i32(4294967295);
      type = types2[i];
      parameters[i] = x = type in options.serializers ? options.serializers[type](x) : "" + x;
      prev = bytes_default.i;
      bytes_default.inc(4).str(x).i32(bytes_default.i - prev - 4, prev);
    });
    bytes_default.i16(0);
    return bytes_default.end();
  }
  function Parse(str, parameters, types2, name = "") {
    bytes_default().P().str(name + bytes_default.N).str(str + bytes_default.N).i16(parameters.length);
    parameters.forEach((x, i) => bytes_default.i32(types2[i] || 0));
    return bytes_default.end();
  }
  function Describe(x, name = "") {
    return bytes_default().D().str(x).str(name + bytes_default.N).end();
  }
  function Execute(portal = "", rows2 = 0) {
    return Buffer.concat([
      bytes_default().E().str(portal + bytes_default.N).i32(rows2).end(),
      Flush
    ]);
  }
  function Close(portal = "") {
    return Buffer.concat([
      bytes_default().C().str("P").str(portal + bytes_default.N).end(),
      bytes_default().S().end()
    ]);
  }
  function StartupMessage() {
    return cancelMessage || bytes_default().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign(
        {
          user,
          database,
          client_encoding: "UTF8"
        },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes_default.N + v).join(bytes_default.N)
    ).z(2).end(0);
  }
}
function parseError(x) {
  const error = {};
  let start = 5;
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
      start = i + 1;
    }
  }
  return error;
}
function md5(x) {
  return crypto2.createHash("md5").update(x).digest("hex");
}
function hmac(key, x) {
  return crypto2.createHmac("sha256", key).update(x).digest();
}
function sha256(x) {
  return crypto2.createHash("sha256").update(x).digest();
}
function xor(a, b2) {
  const length = Math.max(a.length, b2.length);
  const buffer2 = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++)
    buffer2[i] = a[i] ^ b2[i];
  return buffer2;
}
function timer(fn, seconds) {
  seconds = typeof seconds === "function" ? seconds() : seconds;
  if (!seconds)
    return { cancel: noop, start: noop };
  let timer2;
  return {
    cancel() {
      timer2 && (clearTimeout(timer2), timer2 = null);
    },
    start() {
      timer2 && clearTimeout(timer2);
      timer2 = setTimeout(done, seconds * 1e3, arguments);
    }
  };
  function done(args) {
    fn.apply(null, args);
    timer2 = null;
  }
}
var connection_default, uid, Sync, Flush, SSLRequest, ExecuteUnnamed, DescribeUnnamed, noop, retryRoutines, errorFields;
var init_connection = __esm({
  "node_modules/postgres/src/connection.js"() {
    init_types();
    init_errors3();
    init_result();
    init_queue();
    init_query();
    init_bytes();
    connection_default = Connection;
    uid = 1;
    Sync = bytes_default().S().end();
    Flush = bytes_default().H().end();
    SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
    ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
    DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
    noop = () => {
    };
    retryRoutines = /* @__PURE__ */ new Set([
      "FetchPreparedStatement",
      "RevalidateCachedQuery",
      "transformAssignedExpr"
    ]);
    errorFields = {
      83: "severity_local",
      // S
      86: "severity",
      // V
      67: "code",
      // C
      77: "message",
      // M
      68: "detail",
      // D
      72: "hint",
      // H
      80: "position",
      // P
      112: "internal_position",
      // p
      113: "internal_query",
      // q
      87: "where",
      // W
      115: "schema_name",
      // s
      116: "table_name",
      // t
      99: "column_name",
      // c
      100: "data type_name",
      // d
      110: "constraint_name",
      // n
      70: "file",
      // F
      76: "line",
      // L
      82: "routine"
      // R
    };
  }
});

// node_modules/postgres/src/subscribe.js
function Subscribe(postgres2, options) {
  const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
  let connection2, stream, ended = false;
  const sql2 = subscribe.sql = postgres2({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: "database"
    },
    onclose: async function() {
      if (ended)
        return;
      stream = null;
      state.pid = state.secret = void 0;
      connected(await init(sql2, slot, options.publications));
      subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
    },
    no_subscribe: true
  });
  const end = sql2.end, close = sql2.close;
  sql2.end = async () => {
    ended = true;
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return end();
  };
  sql2.close = async () => {
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return close();
  };
  return subscribe;
  async function subscribe(event, fn, onsubscribe = noop2, onerror = noop2) {
    event = parseEvent(event);
    if (!connection2)
      connection2 = init(sql2, slot, options.publications);
    const subscriber = { fn, onsubscribe };
    const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
    const unsubscribe = () => {
      fns.delete(subscriber);
      fns.size === 0 && subscribers.delete(event);
    };
    return connection2.then((x) => {
      connected(x);
      onsubscribe();
      stream && stream.on("error", onerror);
      return { unsubscribe, state, sql: sql2 };
    });
  }
  function connected(x) {
    stream = x.stream;
    state.pid = x.state.pid;
    state.secret = x.state.secret;
  }
  async function init(sql3, slot2, publications) {
    if (!publications)
      throw new Error("Missing publication names");
    const xs = await sql3.unsafe(
      `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    );
    const [x] = xs;
    const stream2 = await sql3.unsafe(
      `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
    ).writable();
    const state2 = {
      lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
    };
    stream2.on("data", data);
    stream2.on("error", error);
    stream2.on("close", sql3.close);
    return { stream: stream2, state: xs.state };
    function error(e) {
      console.error("Unexpected error during logical streaming - reconnecting", e);
    }
    function data(x2) {
      if (x2[0] === 119) {
        parse(x2.subarray(25), state2, sql3.options.parsers, handle, options.transform);
      } else if (x2[0] === 107 && x2[17]) {
        state2.lsn = x2.subarray(1, 9);
        pong();
      }
    }
    function handle(a, b2) {
      const path = b2.relation.schema + "." + b2.relation.table;
      call("*", a, b2);
      call("*:" + path, a, b2);
      b2.relation.keys.length && call("*:" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
      call(b2.command, a, b2);
      call(b2.command + ":" + path, a, b2);
      b2.relation.keys.length && call(b2.command + ":" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
    }
    function pong() {
      const x2 = Buffer.alloc(34);
      x2[0] = "r".charCodeAt(0);
      x2.fill(state2.lsn, 1);
      x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
      stream2.write(x2);
    }
  }
  function call(x, a, b2) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b2, x));
  }
}
function Time(x) {
  return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
}
function parse(x, state, parsers2, handle, transform) {
  const char2 = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
  Object.entries({
    R: (x2) => {
      let i = 1;
      const r = state[x2.readUInt32BE(i)] = {
        schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
        table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
        columns: Array(x2.readUInt16BE(i += 2)),
        keys: []
      };
      i += 2;
      let columnIndex = 0, column;
      while (i < x2.length) {
        column = r.columns[columnIndex++] = {
          key: x2[i++],
          name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
          type: x2.readUInt32BE(i += 1),
          parser: parsers2[x2.readUInt32BE(i)],
          atttypmod: x2.readUInt32BE(i += 4)
        };
        column.key && r.keys.push(column);
        i += 4;
      }
    },
    Y: () => {
    },
    // Type
    O: () => {
    },
    // Origin
    B: (x2) => {
      state.date = Time(x2.readBigInt64BE(9));
      state.lsn = x2.subarray(1, 9);
    },
    I: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      const { row } = tuples(x2, relation.columns, i += 7, transform);
      handle(row, {
        command: "insert",
        relation
      });
    },
    D: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      handle(
        key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform).row : null,
        {
          command: "delete",
          relation,
          key
        }
      );
    },
    U: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      const xs = key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform) : null;
      xs && (i = xs.i);
      const { row } = tuples(x2, relation.columns, i + 3, transform);
      handle(row, {
        command: "update",
        relation,
        key,
        old: xs && xs.row
      });
    },
    T: () => {
    },
    // Truncate,
    C: () => {
    }
    // Commit
  }).reduce(char2, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
  let type, column, value;
  const row = transform.raw ? new Array(columns.length) : {};
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++];
    column = columns[i];
    value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
    transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
  }
  return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
}
function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
  if (!xs)
    throw new Error("Malformed subscribe pattern: " + x);
  const [, command, path, key] = xs;
  return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
}
var noop2;
var init_subscribe = __esm({
  "node_modules/postgres/src/subscribe.js"() {
    noop2 = () => {
    };
  }
});

// node_modules/postgres/src/large.js
import Stream2 from "stream";
function largeObject(sql2, oid, mode = 131072 | 262144) {
  return new Promise(async (resolve, reject) => {
    await sql2.begin(async (sql3) => {
      let finish;
      !oid && ([{ oid }] = await sql3`select lo_creat(-1) as oid`);
      const [{ fd }] = await sql3`select lo_open(${oid}, ${mode}) as fd`;
      const lo = {
        writable,
        readable,
        close: () => sql3`select lo_close(${fd})`.then(finish),
        tell: () => sql3`select lo_tell64(${fd})`,
        read: (x) => sql3`select loread(${fd}, ${x}) as data`,
        write: (x) => sql3`select lowrite(${fd}, ${x})`,
        truncate: (x) => sql3`select lo_truncate64(${fd}, ${x})`,
        seek: (x, whence = 0) => sql3`select lo_lseek64(${fd}, ${x}, ${whence})`,
        size: () => sql3`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      };
      resolve(lo);
      return new Promise(async (r) => finish = r);
      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start;
        start && await lo.seek(start);
        return new Stream2.Readable({
          highWaterMark,
          async read(size2) {
            const l = size2 > max ? size2 - max : size2;
            max -= size2;
            const [{ data }] = await lo.read(l);
            this.push(data);
            if (data.length < size2)
              this.push(null);
          }
        });
      }
      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start);
        return new Stream2.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback);
          }
        });
      }
    }).catch(reject);
  });
}
var init_large = __esm({
  "node_modules/postgres/src/large.js"() {
  }
});

// node_modules/postgres/src/index.js
import os from "os";
import fs from "fs";
function Postgres(a, b2) {
  const options = parseOptions(a, b2), subscribe = options.no_subscribe || Subscribe(Postgres, { ...options });
  let ending = false;
  const queries = queue_default(), connecting = queue_default(), reserved = queue_default(), closed = queue_default(), ended = queue_default(), open = queue_default(), busy = queue_default(), full = queue_default(), queues = { connecting, reserved, closed, ended, open, busy, full };
  const connections = [...Array(options.max)].map(() => connection_default(options, queues, { onopen, onend, onclose }));
  const sql2 = Sql(handler2);
  Object.assign(sql2, {
    get parameters() {
      return options.parameters;
    },
    largeObject: largeObject.bind(null, sql2),
    subscribe,
    CLOSE,
    END: CLOSE,
    PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  });
  return sql2;
  function Sql(handler3) {
    handler3.debug = options.debug;
    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to);
      return acc;
    }, typed);
    Object.assign(sql3, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json: json2,
      file
    });
    return sql3;
    function typed(value, type) {
      return new Parameter(value, type);
    }
    function sql3(strings, ...args) {
      const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler3, cancel) : typeof strings === "string" && !args.length ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings) : new Builder(strings, args);
      return query;
    }
    function unsafe(string, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([string], args, handler3, cancel, {
        prepare: false,
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
    function file(path, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([], args, (query2) => {
        fs.readFile(path, "utf8", (err, string) => {
          if (err)
            return query2.reject(err);
          query2.strings = [string];
          handler3(query2);
        });
      }, cancel, {
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
  }
  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten };
    const sql3 = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
          delete listen.channels[name2];
          Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
          })));
        });
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
      }
    }));
    const channels = listen.channels || (listen.channels = {}), exists2 = name in channels;
    if (exists2) {
      channels[name].listeners.push(listener);
      const result2 = await channels[name].result;
      listener.onlisten && listener.onlisten();
      return { state: result2.state, unlisten };
    }
    channels[name] = { result: sql3`listen ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
    const result = await channels[name].result;
    listener.onlisten && listener.onlisten();
    return { state: result.state, unlisten };
    async function unlisten() {
      if (name in channels === false)
        return;
      channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
      if (channels[name].listeners.length)
        return;
      delete channels[name];
      return sql3`unlisten ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
    }
  }
  async function notify(channel, payload) {
    return await sql2`select pg_notify(${channel}, ${"" + payload})`;
  }
  async function reserve() {
    const queue = queue_default();
    const c = open.length ? open.shift() : await new Promise((resolve, reject) => {
      const query = { reserve: resolve, reject };
      queries.push(query);
      closed.length && connect(closed.shift(), query);
    });
    move(c, reserved);
    c.reserved = () => queue.length ? c.execute(queue.shift()) : move(c, reserved);
    c.reserved.release = true;
    const sql3 = Sql(handler3);
    sql3.release = () => {
      c.reserved = null;
      onopen(c);
    };
    return sql3;
    function handler3(q) {
      c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
    }
  }
  async function begin(options2, fn) {
    !fn && (fn = options2, options2 = "");
    const queries2 = queue_default();
    let savepoints = 0, connection2, prepare = null;
    try {
      await sql2.unsafe("begin " + options2.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
      return await Promise.race([
        scope(connection2, fn),
        new Promise((_, reject) => connection2.onclose = reject)
      ]);
    } catch (error) {
      throw error;
    }
    async function scope(c, fn2, name) {
      const sql3 = Sql(handler3);
      sql3.savepoint = savepoint;
      sql3.prepare = (x) => prepare = x.replace(/[^a-z0-9$-_. ]/gi);
      let uncaughtError, result;
      name && await sql3`savepoint ${sql3(name)}`;
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn2(sql3);
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
        });
        if (uncaughtError)
          throw uncaughtError;
      } catch (e) {
        await (name ? sql3`rollback to ${sql3(name)}` : sql3`rollback`);
        throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
      }
      if (!name) {
        prepare ? await sql3`prepare transaction '${sql3.unsafe(prepare)}'` : await sql3`commit`;
      }
      return result;
      function savepoint(name2, fn3) {
        if (name2 && Array.isArray(name2.raw))
          return savepoint((sql4) => sql4.apply(sql4, arguments));
        arguments.length === 1 && (fn3 = name2, name2 = null);
        return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
      }
      function handler3(q) {
        q.catch((e) => uncaughtError || (uncaughtError = e));
        c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
      }
    }
    function onexecute(c) {
      connection2 = c;
      move(c, reserved);
      c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
    }
  }
  function move(c, queue) {
    c.queue.remove(c);
    queue.push(c);
    c.queue = queue;
    queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
    return c;
  }
  function json2(x) {
    return new Parameter(x, 3802);
  }
  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments));
    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap);
  }
  function handler2(query) {
    if (ending)
      return query.reject(Errors.connection("CONNECTION_ENDED", options, options));
    if (open.length)
      return go(open.shift(), query);
    if (closed.length)
      return connect(closed.shift(), query);
    busy.length ? go(busy.shift(), query) : queries.push(query);
  }
  function go(c, query) {
    return c.execute(query) ? move(c, busy) : move(c, full);
  }
  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state ? query.active ? connection_default(options).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
    });
  }
  async function end({ timeout = null } = {}) {
    if (ending)
      return ending;
    await 1;
    let timer2;
    return ending = Promise.race([
      new Promise((r) => timeout !== null && (timer2 = setTimeout(destroy, timeout * 1e3, r))),
      Promise.all(connections.map((c) => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer2));
  }
  async function close() {
    await Promise.all(connections.map((c) => c.end()));
  }
  async function destroy(resolve) {
    await Promise.all(connections.map((c) => c.terminate()));
    while (queries.length)
      queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options));
    resolve();
  }
  function connect(c, query) {
    move(c, connecting);
    c.connect(query);
    return c;
  }
  function onend(c) {
    move(c, ended);
  }
  function onopen(c) {
    if (queries.length === 0)
      return move(c, open);
    let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
    while (ready && queries.length && max-- > 0) {
      const query = queries.shift();
      if (query.reserve)
        return query.reserve(c);
      ready = c.execute(query);
    }
    ready ? move(c, busy) : move(c, full);
  }
  function onclose(c, e) {
    move(c, closed);
    c.reserved = null;
    c.onclose && (c.onclose(e), c.onclose = null);
    options.onclose && options.onclose(c.id);
    queries.length && connect(c, queries.shift());
  }
}
function parseOptions(a, b2) {
  if (a && a.shared)
    return a;
  const env = process.env, o = (!a || typeof a === "string" ? b2 : a) || {}, { url, multihost } = parseUrl(a), query = [...url.searchParams].reduce((a2, [b3, c]) => (a2[b3] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || "localhost", port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
  o.no_prepare && (o.prepare = false);
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
  "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
  query.sslrootcert === "system" && (query.ssl = "verify-full");
  const ints = ["idle_timeout", "connect_timeout", "max_lifetime", "max_pipeline", "backoff", "keep_alive"];
  const defaults = {
    max: globalThis.Cloudflare ? 3 : 10,
    ssl: false,
    sslnegotiation: null,
    idle_timeout: null,
    connect_timeout: 30,
    max_lifetime,
    max_pipeline: 100,
    backoff,
    keep_alive: 60,
    prepare: true,
    debug: false,
    fetch_types: true,
    publications: "alltables",
    target_session_attrs: null
  };
  return {
    host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
    port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
    path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
    database: o.database || o.db || (url.pathname || "").slice(1) || env.PGDATABASE || user,
    user,
    pass: o.pass || o.password || url.password || env.PGPASSWORD || "",
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env["PG" + k.toUpperCase()] || d;
        acc[k] = typeof value === "string" && ints.includes(k) ? +value : value;
        return acc;
      },
      {}
    ),
    connection: {
      application_name: env.PGAPPNAME || "postgres.js",
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types: o.types || {},
    target_session_attrs: tsa(o, url, env),
    onnotice: o.onnotice,
    onnotify: o.onnotify,
    onclose: o.onclose,
    onparameter: o.onparameter,
    socket: o.socket,
    transform: parseTransform(o.transform || { undefined: void 0 }),
    parameters: {},
    shared: { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  };
}
function tsa(o, url, env) {
  const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env.PGTARGETSESSIONATTRS;
  if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
    return x;
  throw new Error("target_session_attrs " + x + " is not supported");
}
function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
  return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === "function" ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === "function" ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === "function" ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  };
}
function parseUrl(url) {
  if (!url || typeof url !== "string")
    return { url: { searchParams: /* @__PURE__ */ new Map() } };
  let host = url;
  host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
  host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
  const urlObj = new URL(url.replace(host, host.split(",")[0]));
  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(",") > -1 && host
  };
}
function osUsername() {
  try {
    return os.userInfo().username;
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
  }
}
var src_default;
var init_src = __esm({
  "node_modules/postgres/src/index.js"() {
    init_types();
    init_connection();
    init_query();
    init_queue();
    init_errors3();
    init_subscribe();
    init_large();
    Object.assign(Postgres, {
      PostgresError,
      toPascal,
      pascal,
      toCamel,
      camel,
      toKebab,
      kebab,
      fromPascal,
      fromCamel,
      fromKebab,
      BigInt: {
        to: 20,
        from: [20],
        parse: (x) => BigInt(x),
        // eslint-disable-line
        serialize: (x) => x.toString()
      }
    });
    src_default = Postgres;
  }
});

// node_modules/drizzle-orm/selection-proxy.js
var SelectionProxyHandler;
var init_selection_proxy = __esm({
  "node_modules/drizzle-orm/selection-proxy.js"() {
    init_alias();
    init_column();
    init_entity();
    init_sql();
    init_subquery();
    init_view_common();
    SelectionProxyHandler = class _SelectionProxyHandler {
      static [entityKind] = "SelectionProxyHandler";
      config;
      constructor(config) {
        this.config = { ...config };
      }
      get(subquery, prop) {
        if (prop === "_") {
          return {
            ...subquery["_"],
            selectedFields: new Proxy(
              subquery._.selectedFields,
              this
            )
          };
        }
        if (prop === ViewBaseConfig) {
          return {
            ...subquery[ViewBaseConfig],
            selectedFields: new Proxy(
              subquery[ViewBaseConfig].selectedFields,
              this
            )
          };
        }
        if (typeof prop === "symbol") {
          return subquery[prop];
        }
        const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
        const value = columns[prop];
        if (is(value, SQL.Aliased)) {
          if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
            return value.sql;
          }
          const newValue = value.clone();
          newValue.isSelectionField = true;
          return newValue;
        }
        if (is(value, SQL)) {
          if (this.config.sqlBehavior === "sql") {
            return value;
          }
          throw new Error(
            `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
          );
        }
        if (is(value, Column)) {
          if (this.config.alias) {
            return new Proxy(
              value,
              new ColumnAliasProxyHandler(
                new Proxy(
                  value.table,
                  new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
                )
              )
            );
          }
          return value;
        }
        if (typeof value !== "object" || value === null) {
          return value;
        }
        return new Proxy(value, new _SelectionProxyHandler(this.config));
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/checks.js
var CheckBuilder, Check;
var init_checks = __esm({
  "node_modules/drizzle-orm/pg-core/checks.js"() {
    init_entity();
    CheckBuilder = class {
      constructor(name, value) {
        this.name = name;
        this.value = value;
      }
      static [entityKind] = "PgCheckBuilder";
      brand;
      /** @internal */
      build(table) {
        return new Check(table, this);
      }
    };
    Check = class {
      constructor(table, builder) {
        this.table = table;
        this.name = builder.name;
        this.value = builder.value;
      }
      static [entityKind] = "PgCheck";
      name;
      value;
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/index.js
var init_columns = __esm({
  "node_modules/drizzle-orm/pg-core/columns/index.js"() {
    init_bigint();
    init_bigserial();
    init_boolean();
    init_char();
    init_cidr();
    init_common();
    init_custom();
    init_date();
    init_double_precision();
    init_enum();
    init_inet();
    init_int_common();
    init_integer();
    init_interval();
    init_json();
    init_jsonb();
    init_line();
    init_macaddr();
    init_macaddr8();
    init_numeric();
    init_point();
    init_geometry();
    init_real();
    init_serial();
    init_smallint();
    init_smallserial();
    init_text();
    init_time();
    init_timestamp();
    init_uuid();
    init_varchar();
    init_bit();
    init_halfvec();
    init_sparsevec();
    init_vector();
  }
});

// node_modules/drizzle-orm/pg-core/indexes.js
function index(name) {
  return new IndexBuilderOn(false, name);
}
function uniqueIndex(name) {
  return new IndexBuilderOn(true, name);
}
var IndexBuilderOn, IndexBuilder, Index;
var init_indexes = __esm({
  "node_modules/drizzle-orm/pg-core/indexes.js"() {
    init_sql();
    init_entity();
    init_columns();
    IndexBuilderOn = class {
      constructor(unique, name) {
        this.unique = unique;
        this.name = name;
      }
      static [entityKind] = "PgIndexBuilderOn";
      on(...columns) {
        return new IndexBuilder(
          columns.map((it) => {
            if (is(it, SQL)) {
              return it;
            }
            it = it;
            const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
            it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
            return clonedIndexedColumn;
          }),
          this.unique,
          false,
          this.name
        );
      }
      onOnly(...columns) {
        return new IndexBuilder(
          columns.map((it) => {
            if (is(it, SQL)) {
              return it;
            }
            it = it;
            const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
            it.indexConfig = it.defaultConfig;
            return clonedIndexedColumn;
          }),
          this.unique,
          true,
          this.name
        );
      }
      /**
       * Specify what index method to use. Choices are `btree`, `hash`, `gist`, `spgist`, `gin`, `brin`, or user-installed access methods like `bloom`. The default method is `btree.
       *
       * If you have the `pg_vector` extension installed in your database, you can use the `hnsw` and `ivfflat` options, which are predefined types.
       *
       * **You can always specify any string you want in the method, in case Drizzle doesn't have it natively in its types**
       *
       * @param method The name of the index method to be used
       * @param columns
       * @returns
       */
      using(method, ...columns) {
        return new IndexBuilder(
          columns.map((it) => {
            if (is(it, SQL)) {
              return it;
            }
            it = it;
            const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
            it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
            return clonedIndexedColumn;
          }),
          this.unique,
          true,
          this.name,
          method
        );
      }
    };
    IndexBuilder = class {
      static [entityKind] = "PgIndexBuilder";
      /** @internal */
      config;
      constructor(columns, unique, only, name, method = "btree") {
        this.config = {
          name,
          columns,
          unique,
          only,
          method
        };
      }
      concurrently() {
        this.config.concurrently = true;
        return this;
      }
      with(obj) {
        this.config.with = obj;
        return this;
      }
      where(condition) {
        this.config.where = condition;
        return this;
      }
      /** @internal */
      build(table) {
        return new Index(this.config, table);
      }
    };
    Index = class {
      static [entityKind] = "PgIndex";
      config;
      constructor(config, table) {
        this.config = { ...config, table };
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/policies.js
var PgPolicy;
var init_policies = __esm({
  "node_modules/drizzle-orm/pg-core/policies.js"() {
    init_entity();
    PgPolicy = class {
      constructor(name, config) {
        this.name = name;
        if (config) {
          this.as = config.as;
          this.for = config.for;
          this.to = config.to;
          this.using = config.using;
          this.withCheck = config.withCheck;
        }
      }
      static [entityKind] = "PgPolicy";
      as;
      for;
      to;
      using;
      withCheck;
      /** @internal */
      _linkedTable;
      link(table) {
        this._linkedTable = table;
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/view-common.js
var PgViewConfig;
var init_view_common2 = __esm({
  "node_modules/drizzle-orm/pg-core/view-common.js"() {
    PgViewConfig = /* @__PURE__ */ Symbol.for("drizzle:PgViewConfig");
  }
});

// node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var CasingCache;
var init_casing = __esm({
  "node_modules/drizzle-orm/casing.js"() {
    init_entity();
    init_table();
    CasingCache = class {
      static [entityKind] = "CasingCache";
      /** @internal */
      cache = {};
      cachedTables = {};
      convert;
      constructor(casing) {
        this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
      }
      getColumnCasing(column) {
        if (!column.keyAsName) return column.name;
        const schema = column.table[Table.Symbol.Schema] ?? "public";
        const tableName = column.table[Table.Symbol.OriginalName];
        const key = `${schema}.${tableName}.${column.name}`;
        if (!this.cache[key]) {
          this.cacheTable(column.table);
        }
        return this.cache[key];
      }
      cacheTable(table) {
        const schema = table[Table.Symbol.Schema] ?? "public";
        const tableName = table[Table.Symbol.OriginalName];
        const tableKey = `${schema}.${tableName}`;
        if (!this.cachedTables[tableKey]) {
          for (const column of Object.values(table[Table.Symbol.Columns])) {
            const columnKey = `${tableKey}.${column.name}`;
            this.cache[columnKey] = this.convert(column.name);
          }
          this.cachedTables[tableKey] = true;
        }
      }
      clearCache() {
        this.cache = {};
        this.cachedTables = {};
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/view-base.js
var PgViewBase;
var init_view_base = __esm({
  "node_modules/drizzle-orm/pg-core/view-base.js"() {
    init_entity();
    init_sql();
    PgViewBase = class extends View {
      static [entityKind] = "PgViewBase";
    };
  }
});

// node_modules/drizzle-orm/pg-core/dialect.js
var PgDialect;
var init_dialect = __esm({
  "node_modules/drizzle-orm/pg-core/dialect.js"() {
    init_alias();
    init_casing();
    init_column();
    init_entity();
    init_errors2();
    init_columns();
    init_table2();
    init_relations();
    init_sql2();
    init_sql();
    init_subquery();
    init_table();
    init_utils();
    init_view_common();
    init_view_base();
    PgDialect = class {
      static [entityKind] = "PgDialect";
      /** @internal */
      casing;
      constructor(config) {
        this.casing = new CasingCache(config?.casing);
      }
      async migrate(migrations, session, config) {
        const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
        const migrationsSchema = typeof config === "string" ? "drizzle" : config.migrationsSchema ?? "drizzle";
        const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
        await session.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`);
        await session.execute(migrationTableCreate);
        const dbMigrations = await session.all(
          sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} order by created_at desc limit 1`
        );
        const lastDbMigration = dbMigrations[0];
        await session.transaction(async (tx) => {
          for await (const migration of migrations) {
            if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
              for (const stmt of migration.sql) {
                await tx.execute(sql.raw(stmt));
              }
              await tx.execute(
                sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`
              );
            }
          }
        });
      }
      escapeName(name) {
        return `"${name.replace(/"/g, '""')}"`;
      }
      escapeParam(num) {
        return `$${num + 1}`;
      }
      escapeString(str) {
        return `'${str.replace(/'/g, "''")}'`;
      }
      buildWithCTE(queries) {
        if (!queries?.length) return void 0;
        const withSqlChunks = [sql`with `];
        for (const [i, w] of queries.entries()) {
          withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
          if (i < queries.length - 1) {
            withSqlChunks.push(sql`, `);
          }
        }
        withSqlChunks.push(sql` `);
        return sql.join(withSqlChunks);
      }
      buildDeleteQuery({ table, where, returning, withList }) {
        const withSql = this.buildWithCTE(withList);
        const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
        const whereSql = where ? sql` where ${where}` : void 0;
        return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
      }
      buildUpdateSet(table, set) {
        const tableColumns = table[Table.Symbol.Columns];
        const columnNames = Object.keys(tableColumns).filter(
          (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
        );
        const setSize = columnNames.length;
        return sql.join(columnNames.flatMap((colName, i) => {
          const col = tableColumns[colName];
          const onUpdateFnResult = col.onUpdateFn?.();
          const value = set[colName] ?? (is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col));
          const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
          if (i < setSize - 1) {
            return [res, sql.raw(", ")];
          }
          return [res];
        }));
      }
      buildUpdateQuery({ table, set, where, returning, withList, from, joins }) {
        const withSql = this.buildWithCTE(withList);
        const tableName = table[PgTable.Symbol.Name];
        const tableSchema = table[PgTable.Symbol.Schema];
        const origTableName = table[PgTable.Symbol.OriginalName];
        const alias = tableName === origTableName ? void 0 : tableName;
        const tableSql = sql`${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}`;
        const setSql = this.buildUpdateSet(table, set);
        const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
        const joinsSql = this.buildJoins(joins);
        const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: !from })}` : void 0;
        const whereSql = where ? sql` where ${where}` : void 0;
        return sql`${withSql}update ${tableSql} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}`;
      }
      /**
       * Builds selection SQL with provided fields/expressions
       *
       * Examples:
       *
       * `select <selection> from`
       *
       * `insert ... returning <selection>`
       *
       * If `isSingleTable` is true, then columns won't be prefixed with table name
       */
      buildSelection(fields, { isSingleTable = false } = {}) {
        const columnsLen = fields.length;
        const chunks = fields.flatMap(({ field }, i) => {
          const chunk = [];
          if (is(field, SQL.Aliased) && field.isSelectionField) {
            chunk.push(sql.identifier(field.fieldAlias));
          } else if (is(field, SQL.Aliased) || is(field, SQL)) {
            const query = is(field, SQL.Aliased) ? field.sql : field;
            if (isSingleTable) {
              chunk.push(
                new SQL(
                  query.queryChunks.map((c) => {
                    if (is(c, PgColumn)) {
                      return sql.identifier(this.casing.getColumnCasing(c));
                    }
                    return c;
                  })
                )
              );
            } else {
              chunk.push(query);
            }
            if (is(field, SQL.Aliased)) {
              chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
            }
          } else if (is(field, Column)) {
            if (isSingleTable) {
              chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
            } else {
              chunk.push(field);
            }
          } else if (is(field, Subquery)) {
            const entries = Object.entries(field._.selectedFields);
            if (entries.length === 1) {
              const entry = entries[0][1];
              const fieldDecoder = is(entry, SQL) ? entry.decoder : is(entry, Column) ? { mapFromDriverValue: (v) => entry.mapFromDriverValue(v) } : entry.sql.decoder;
              if (fieldDecoder) {
                field._.sql.decoder = fieldDecoder;
              }
            }
            chunk.push(field);
          }
          if (i < columnsLen - 1) {
            chunk.push(sql`, `);
          }
          return chunk;
        });
        return sql.join(chunks);
      }
      buildJoins(joins) {
        if (!joins || joins.length === 0) {
          return void 0;
        }
        const joinsArray = [];
        for (const [index2, joinMeta] of joins.entries()) {
          if (index2 === 0) {
            joinsArray.push(sql` `);
          }
          const table = joinMeta.table;
          const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
          const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
          if (is(table, PgTable)) {
            const tableName = table[PgTable.Symbol.Name];
            const tableSchema = table[PgTable.Symbol.Schema];
            const origTableName = table[PgTable.Symbol.OriginalName];
            const alias = tableName === origTableName ? void 0 : joinMeta.alias;
            joinsArray.push(
              sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
            );
          } else if (is(table, View)) {
            const viewName = table[ViewBaseConfig].name;
            const viewSchema = table[ViewBaseConfig].schema;
            const origViewName = table[ViewBaseConfig].originalName;
            const alias = viewName === origViewName ? void 0 : joinMeta.alias;
            joinsArray.push(
              sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
            );
          } else {
            joinsArray.push(
              sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table}${onSql}`
            );
          }
          if (index2 < joins.length - 1) {
            joinsArray.push(sql` `);
          }
        }
        return sql.join(joinsArray);
      }
      buildFromTable(table) {
        if (is(table, Table) && table[Table.Symbol.IsAlias]) {
          let fullName = sql`${sql.identifier(table[Table.Symbol.OriginalName])}`;
          if (table[Table.Symbol.Schema]) {
            fullName = sql`${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
          }
          return sql`${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
        }
        return table;
      }
      buildSelectQuery({
        withList,
        fields,
        fieldsFlat,
        where,
        having,
        table,
        joins,
        orderBy,
        groupBy,
        limit,
        offset,
        lockingClause,
        distinct,
        setOperators
      }) {
        const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
        for (const f of fieldsList) {
          if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, PgViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
            ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
          ))(f.field.table)) {
            const tableName = getTableName(f.field.table);
            throw new Error(
              `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
            );
          }
        }
        const isSingleTable = !joins || joins.length === 0;
        const withSql = this.buildWithCTE(withList);
        let distinctSql;
        if (distinct) {
          distinctSql = distinct === true ? sql` distinct` : sql` distinct on (${sql.join(distinct.on, sql`, `)})`;
        }
        const selection = this.buildSelection(fieldsList, { isSingleTable });
        const tableSql = this.buildFromTable(table);
        const joinsSql = this.buildJoins(joins);
        const whereSql = where ? sql` where ${where}` : void 0;
        const havingSql = having ? sql` having ${having}` : void 0;
        let orderBySql;
        if (orderBy && orderBy.length > 0) {
          orderBySql = sql` order by ${sql.join(orderBy, sql`, `)}`;
        }
        let groupBySql;
        if (groupBy && groupBy.length > 0) {
          groupBySql = sql` group by ${sql.join(groupBy, sql`, `)}`;
        }
        const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
        const offsetSql = offset ? sql` offset ${offset}` : void 0;
        const lockingClauseSql = sql.empty();
        if (lockingClause) {
          const clauseSql = sql` for ${sql.raw(lockingClause.strength)}`;
          if (lockingClause.config.of) {
            clauseSql.append(
              sql` of ${sql.join(
                Array.isArray(lockingClause.config.of) ? lockingClause.config.of : [lockingClause.config.of],
                sql`, `
              )}`
            );
          }
          if (lockingClause.config.noWait) {
            clauseSql.append(sql` nowait`);
          } else if (lockingClause.config.skipLocked) {
            clauseSql.append(sql` skip locked`);
          }
          lockingClauseSql.append(clauseSql);
        }
        const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClauseSql}`;
        if (setOperators.length > 0) {
          return this.buildSetOperations(finalQuery, setOperators);
        }
        return finalQuery;
      }
      buildSetOperations(leftSelect, setOperators) {
        const [setOperator, ...rest] = setOperators;
        if (!setOperator) {
          throw new Error("Cannot pass undefined values to any set operator");
        }
        if (rest.length === 0) {
          return this.buildSetOperationQuery({ leftSelect, setOperator });
        }
        return this.buildSetOperations(
          this.buildSetOperationQuery({ leftSelect, setOperator }),
          rest
        );
      }
      buildSetOperationQuery({
        leftSelect,
        setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
      }) {
        const leftChunk = sql`(${leftSelect.getSQL()}) `;
        const rightChunk = sql`(${rightSelect.getSQL()})`;
        let orderBySql;
        if (orderBy && orderBy.length > 0) {
          const orderByValues = [];
          for (const singleOrderBy of orderBy) {
            if (is(singleOrderBy, PgColumn)) {
              orderByValues.push(sql.identifier(singleOrderBy.name));
            } else if (is(singleOrderBy, SQL)) {
              for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
                const chunk = singleOrderBy.queryChunks[i];
                if (is(chunk, PgColumn)) {
                  singleOrderBy.queryChunks[i] = sql.identifier(chunk.name);
                }
              }
              orderByValues.push(sql`${singleOrderBy}`);
            } else {
              orderByValues.push(sql`${singleOrderBy}`);
            }
          }
          orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
        }
        const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
        const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
        const offsetSql = offset ? sql` offset ${offset}` : void 0;
        return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
      }
      buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select: select2, overridingSystemValue_ }) {
        const valuesSqlList = [];
        const columns = table[Table.Symbol.Columns];
        const colEntries = Object.entries(columns).filter(([_, col]) => !col.shouldDisableInsert());
        const insertOrder = colEntries.map(
          ([, column]) => sql.identifier(this.casing.getColumnCasing(column))
        );
        if (select2) {
          const select22 = valuesOrSelect;
          if (is(select22, SQL)) {
            valuesSqlList.push(select22);
          } else {
            valuesSqlList.push(select22.getSQL());
          }
        } else {
          const values2 = valuesOrSelect;
          valuesSqlList.push(sql.raw("values "));
          for (const [valueIndex, value] of values2.entries()) {
            const valueList = [];
            for (const [fieldName, col] of colEntries) {
              const colValue = value[fieldName];
              if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
                if (col.defaultFn !== void 0) {
                  const defaultFnResult = col.defaultFn();
                  const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
                  valueList.push(defaultValue);
                } else if (!col.default && col.onUpdateFn !== void 0) {
                  const onUpdateFnResult = col.onUpdateFn();
                  const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
                  valueList.push(newValue);
                } else {
                  valueList.push(sql`default`);
                }
              } else {
                valueList.push(colValue);
              }
            }
            valuesSqlList.push(valueList);
            if (valueIndex < values2.length - 1) {
              valuesSqlList.push(sql`, `);
            }
          }
        }
        const withSql = this.buildWithCTE(withList);
        const valuesSql = sql.join(valuesSqlList);
        const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
        const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : void 0;
        const overridingSql = overridingSystemValue_ === true ? sql`overriding system value ` : void 0;
        return sql`${withSql}insert into ${table} ${insertOrder} ${overridingSql}${valuesSql}${onConflictSql}${returningSql}`;
      }
      buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
        const concurrentlySql = concurrently ? sql` concurrently` : void 0;
        const withNoDataSql = withNoData ? sql` with no data` : void 0;
        return sql`refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
      }
      prepareTyping(encoder) {
        if (is(encoder, PgJsonb) || is(encoder, PgJson)) {
          return "json";
        } else if (is(encoder, PgNumeric)) {
          return "decimal";
        } else if (is(encoder, PgTime)) {
          return "time";
        } else if (is(encoder, PgTimestamp) || is(encoder, PgTimestampString)) {
          return "timestamp";
        } else if (is(encoder, PgDate) || is(encoder, PgDateString)) {
          return "date";
        } else if (is(encoder, PgUUID)) {
          return "uuid";
        } else {
          return "none";
        }
      }
      sqlToQuery(sql2, invokeSource) {
        return sql2.toQuery({
          casing: this.casing,
          escapeName: this.escapeName,
          escapeParam: this.escapeParam,
          escapeString: this.escapeString,
          prepareTyping: this.prepareTyping,
          invokeSource
        });
      }
      // buildRelationalQueryWithPK({
      // 	fullSchema,
      // 	schema,
      // 	tableNamesMap,
      // 	table,
      // 	tableConfig,
      // 	queryConfig: config,
      // 	tableAlias,
      // 	isRoot = false,
      // 	joinOn,
      // }: {
      // 	fullSchema: Record<string, unknown>;
      // 	schema: TablesRelationalConfig;
      // 	tableNamesMap: Record<string, string>;
      // 	table: PgTable;
      // 	tableConfig: TableRelationalConfig;
      // 	queryConfig: true | DBQueryConfig<'many', true>;
      // 	tableAlias: string;
      // 	isRoot?: boolean;
      // 	joinOn?: SQL;
      // }): BuildRelationalQueryResult<PgTable, PgColumn> {
      // 	// For { "<relation>": true }, return a table with selection of all columns
      // 	if (config === true) {
      // 		const selectionEntries = Object.entries(tableConfig.columns);
      // 		const selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = selectionEntries.map((
      // 			[key, value],
      // 		) => ({
      // 			dbKey: value.name,
      // 			tsKey: key,
      // 			field: value as PgColumn,
      // 			relationTableTsKey: undefined,
      // 			isJson: false,
      // 			selection: [],
      // 		}));
      // 		return {
      // 			tableTsKey: tableConfig.tsName,
      // 			sql: table,
      // 			selection,
      // 		};
      // 	}
      // 	// let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
      // 	// let selectionForBuild = selection;
      // 	const aliasedColumns = Object.fromEntries(
      // 		Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]),
      // 	);
      // 	const aliasedRelations = Object.fromEntries(
      // 		Object.entries(tableConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]),
      // 	);
      // 	const aliasedFields = Object.assign({}, aliasedColumns, aliasedRelations);
      // 	let where, hasUserDefinedWhere;
      // 	if (config.where) {
      // 		const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, operators) : config.where;
      // 		where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      // 		hasUserDefinedWhere = !!where;
      // 	}
      // 	where = and(joinOn, where);
      // 	// const fieldsSelection: { tsKey: string; value: PgColumn | SQL.Aliased; isExtra?: boolean }[] = [];
      // 	let joins: Join[] = [];
      // 	let selectedColumns: string[] = [];
      // 	// Figure out which columns to select
      // 	if (config.columns) {
      // 		let isIncludeMode = false;
      // 		for (const [field, value] of Object.entries(config.columns)) {
      // 			if (value === undefined) {
      // 				continue;
      // 			}
      // 			if (field in tableConfig.columns) {
      // 				if (!isIncludeMode && value === true) {
      // 					isIncludeMode = true;
      // 				}
      // 				selectedColumns.push(field);
      // 			}
      // 		}
      // 		if (selectedColumns.length > 0) {
      // 			selectedColumns = isIncludeMode
      // 				? selectedColumns.filter((c) => config.columns?.[c] === true)
      // 				: Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
      // 		}
      // 	} else {
      // 		// Select all columns if selection is not specified
      // 		selectedColumns = Object.keys(tableConfig.columns);
      // 	}
      // 	// for (const field of selectedColumns) {
      // 	// 	const column = tableConfig.columns[field]! as PgColumn;
      // 	// 	fieldsSelection.push({ tsKey: field, value: column });
      // 	// }
      // 	let initiallySelectedRelations: {
      // 		tsKey: string;
      // 		queryConfig: true | DBQueryConfig<'many', false>;
      // 		relation: Relation;
      // 	}[] = [];
      // 	// let selectedRelations: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
      // 	// Figure out which relations to select
      // 	if (config.with) {
      // 		initiallySelectedRelations = Object.entries(config.with)
      // 			.filter((entry): entry is [typeof entry[0], NonNullable<typeof entry[1]>] => !!entry[1])
      // 			.map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey]! }));
      // 	}
      // 	const manyRelations = initiallySelectedRelations.filter((r) =>
      // 		is(r.relation, Many)
      // 		&& (schema[tableNamesMap[r.relation.referencedTable[Table.Symbol.Name]]!]?.primaryKey.length ?? 0) > 0
      // 	);
      // 	// If this is the last Many relation (or there are no Many relations), we are on the innermost subquery level
      // 	const isInnermostQuery = manyRelations.length < 2;
      // 	const selectedExtras: {
      // 		tsKey: string;
      // 		value: SQL.Aliased;
      // 	}[] = [];
      // 	// Figure out which extras to select
      // 	if (isInnermostQuery && config.extras) {
      // 		const extras = typeof config.extras === 'function'
      // 			? config.extras(aliasedFields, { sql })
      // 			: config.extras;
      // 		for (const [tsKey, value] of Object.entries(extras)) {
      // 			selectedExtras.push({
      // 				tsKey,
      // 				value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
      // 			});
      // 		}
      // 	}
      // 	// Transform `fieldsSelection` into `selection`
      // 	// `fieldsSelection` shouldn't be used after this point
      // 	// for (const { tsKey, value, isExtra } of fieldsSelection) {
      // 	// 	selection.push({
      // 	// 		dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey]!.name,
      // 	// 		tsKey,
      // 	// 		field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
      // 	// 		relationTableTsKey: undefined,
      // 	// 		isJson: false,
      // 	// 		isExtra,
      // 	// 		selection: [],
      // 	// 	});
      // 	// }
      // 	let orderByOrig = typeof config.orderBy === 'function'
      // 		? config.orderBy(aliasedFields, orderByOperators)
      // 		: config.orderBy ?? [];
      // 	if (!Array.isArray(orderByOrig)) {
      // 		orderByOrig = [orderByOrig];
      // 	}
      // 	const orderBy = orderByOrig.map((orderByValue) => {
      // 		if (is(orderByValue, Column)) {
      // 			return aliasedTableColumn(orderByValue, tableAlias) as PgColumn;
      // 		}
      // 		return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      // 	});
      // 	const limit = isInnermostQuery ? config.limit : undefined;
      // 	const offset = isInnermostQuery ? config.offset : undefined;
      // 	// For non-root queries without additional config except columns, return a table with selection
      // 	if (
      // 		!isRoot
      // 		&& initiallySelectedRelations.length === 0
      // 		&& selectedExtras.length === 0
      // 		&& !where
      // 		&& orderBy.length === 0
      // 		&& limit === undefined
      // 		&& offset === undefined
      // 	) {
      // 		return {
      // 			tableTsKey: tableConfig.tsName,
      // 			sql: table,
      // 			selection: selectedColumns.map((key) => ({
      // 				dbKey: tableConfig.columns[key]!.name,
      // 				tsKey: key,
      // 				field: tableConfig.columns[key] as PgColumn,
      // 				relationTableTsKey: undefined,
      // 				isJson: false,
      // 				selection: [],
      // 			})),
      // 		};
      // 	}
      // 	const selectedRelationsWithoutPK:
      // 	// Process all relations without primary keys, because they need to be joined differently and will all be on the same query level
      // 	for (
      // 		const {
      // 			tsKey: selectedRelationTsKey,
      // 			queryConfig: selectedRelationConfigValue,
      // 			relation,
      // 		} of initiallySelectedRelations
      // 	) {
      // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
      // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
      // 		const relationTableTsName = tableNamesMap[relationTableName]!;
      // 		const relationTable = schema[relationTableTsName]!;
      // 		if (relationTable.primaryKey.length > 0) {
      // 			continue;
      // 		}
      // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
      // 		const joinOn = and(
      // 			...normalizedRelation.fields.map((field, i) =>
      // 				eq(
      // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
      // 					aliasedTableColumn(field, tableAlias),
      // 				)
      // 			),
      // 		);
      // 		const builtRelation = this.buildRelationalQueryWithoutPK({
      // 			fullSchema,
      // 			schema,
      // 			tableNamesMap,
      // 			table: fullSchema[relationTableTsName] as PgTable,
      // 			tableConfig: schema[relationTableTsName]!,
      // 			queryConfig: selectedRelationConfigValue,
      // 			tableAlias: relationTableAlias,
      // 			joinOn,
      // 			nestedQueryRelation: relation,
      // 		});
      // 		const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier('data')}`.as(selectedRelationTsKey);
      // 		joins.push({
      // 			on: sql`true`,
      // 			table: new Subquery(builtRelation.sql as SQL, {}, relationTableAlias),
      // 			alias: relationTableAlias,
      // 			joinType: 'left',
      // 			lateral: true,
      // 		});
      // 		selectedRelations.push({
      // 			dbKey: selectedRelationTsKey,
      // 			tsKey: selectedRelationTsKey,
      // 			field,
      // 			relationTableTsKey: relationTableTsName,
      // 			isJson: true,
      // 			selection: builtRelation.selection,
      // 		});
      // 	}
      // 	const oneRelations = initiallySelectedRelations.filter((r): r is typeof r & { relation: One } =>
      // 		is(r.relation, One)
      // 	);
      // 	// Process all One relations with PKs, because they can all be joined on the same level
      // 	for (
      // 		const {
      // 			tsKey: selectedRelationTsKey,
      // 			queryConfig: selectedRelationConfigValue,
      // 			relation,
      // 		} of oneRelations
      // 	) {
      // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
      // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
      // 		const relationTableTsName = tableNamesMap[relationTableName]!;
      // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
      // 		const relationTable = schema[relationTableTsName]!;
      // 		if (relationTable.primaryKey.length === 0) {
      // 			continue;
      // 		}
      // 		const joinOn = and(
      // 			...normalizedRelation.fields.map((field, i) =>
      // 				eq(
      // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
      // 					aliasedTableColumn(field, tableAlias),
      // 				)
      // 			),
      // 		);
      // 		const builtRelation = this.buildRelationalQueryWithPK({
      // 			fullSchema,
      // 			schema,
      // 			tableNamesMap,
      // 			table: fullSchema[relationTableTsName] as PgTable,
      // 			tableConfig: schema[relationTableTsName]!,
      // 			queryConfig: selectedRelationConfigValue,
      // 			tableAlias: relationTableAlias,
      // 			joinOn,
      // 		});
      // 		const field = sql`case when ${sql.identifier(relationTableAlias)} is null then null else json_build_array(${
      // 			sql.join(
      // 				builtRelation.selection.map(({ field }) =>
      // 					is(field, SQL.Aliased)
      // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
      // 						: is(field, Column)
      // 						? aliasedTableColumn(field, relationTableAlias)
      // 						: field
      // 				),
      // 				sql`, `,
      // 			)
      // 		}) end`.as(selectedRelationTsKey);
      // 		const isLateralJoin = is(builtRelation.sql, SQL);
      // 		joins.push({
      // 			on: isLateralJoin ? sql`true` : joinOn,
      // 			table: is(builtRelation.sql, SQL)
      // 				? new Subquery(builtRelation.sql, {}, relationTableAlias)
      // 				: aliasedTable(builtRelation.sql, relationTableAlias),
      // 			alias: relationTableAlias,
      // 			joinType: 'left',
      // 			lateral: is(builtRelation.sql, SQL),
      // 		});
      // 		selectedRelations.push({
      // 			dbKey: selectedRelationTsKey,
      // 			tsKey: selectedRelationTsKey,
      // 			field,
      // 			relationTableTsKey: relationTableTsName,
      // 			isJson: true,
      // 			selection: builtRelation.selection,
      // 		});
      // 	}
      // 	let distinct: PgSelectConfig['distinct'];
      // 	let tableFrom: PgTable | Subquery = table;
      // 	// Process first Many relation - each one requires a nested subquery
      // 	const manyRelation = manyRelations[0];
      // 	if (manyRelation) {
      // 		const {
      // 			tsKey: selectedRelationTsKey,
      // 			queryConfig: selectedRelationQueryConfig,
      // 			relation,
      // 		} = manyRelation;
      // 		distinct = {
      // 			on: tableConfig.primaryKey.map((c) => aliasedTableColumn(c as PgColumn, tableAlias)),
      // 		};
      // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
      // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
      // 		const relationTableTsName = tableNamesMap[relationTableName]!;
      // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
      // 		const joinOn = and(
      // 			...normalizedRelation.fields.map((field, i) =>
      // 				eq(
      // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
      // 					aliasedTableColumn(field, tableAlias),
      // 				)
      // 			),
      // 		);
      // 		const builtRelationJoin = this.buildRelationalQueryWithPK({
      // 			fullSchema,
      // 			schema,
      // 			tableNamesMap,
      // 			table: fullSchema[relationTableTsName] as PgTable,
      // 			tableConfig: schema[relationTableTsName]!,
      // 			queryConfig: selectedRelationQueryConfig,
      // 			tableAlias: relationTableAlias,
      // 			joinOn,
      // 		});
      // 		const builtRelationSelectionField = sql`case when ${
      // 			sql.identifier(relationTableAlias)
      // 		} is null then '[]' else json_agg(json_build_array(${
      // 			sql.join(
      // 				builtRelationJoin.selection.map(({ field }) =>
      // 					is(field, SQL.Aliased)
      // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
      // 						: is(field, Column)
      // 						? aliasedTableColumn(field, relationTableAlias)
      // 						: field
      // 				),
      // 				sql`, `,
      // 			)
      // 		})) over (partition by ${sql.join(distinct.on, sql`, `)}) end`.as(selectedRelationTsKey);
      // 		const isLateralJoin = is(builtRelationJoin.sql, SQL);
      // 		joins.push({
      // 			on: isLateralJoin ? sql`true` : joinOn,
      // 			table: isLateralJoin
      // 				? new Subquery(builtRelationJoin.sql as SQL, {}, relationTableAlias)
      // 				: aliasedTable(builtRelationJoin.sql as PgTable, relationTableAlias),
      // 			alias: relationTableAlias,
      // 			joinType: 'left',
      // 			lateral: isLateralJoin,
      // 		});
      // 		// Build the "from" subquery with the remaining Many relations
      // 		const builtTableFrom = this.buildRelationalQueryWithPK({
      // 			fullSchema,
      // 			schema,
      // 			tableNamesMap,
      // 			table,
      // 			tableConfig,
      // 			queryConfig: {
      // 				...config,
      // 				where: undefined,
      // 				orderBy: undefined,
      // 				limit: undefined,
      // 				offset: undefined,
      // 				with: manyRelations.slice(1).reduce<NonNullable<typeof config['with']>>(
      // 					(result, { tsKey, queryConfig: configValue }) => {
      // 						result[tsKey] = configValue;
      // 						return result;
      // 					},
      // 					{},
      // 				),
      // 			},
      // 			tableAlias,
      // 		});
      // 		selectedRelations.push({
      // 			dbKey: selectedRelationTsKey,
      // 			tsKey: selectedRelationTsKey,
      // 			field: builtRelationSelectionField,
      // 			relationTableTsKey: relationTableTsName,
      // 			isJson: true,
      // 			selection: builtRelationJoin.selection,
      // 		});
      // 		// selection = builtTableFrom.selection.map((item) =>
      // 		// 	is(item.field, SQL.Aliased)
      // 		// 		? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
      // 		// 		: item
      // 		// );
      // 		// selectionForBuild = [{
      // 		// 	dbKey: '*',
      // 		// 	tsKey: '*',
      // 		// 	field: sql`${sql.identifier(tableAlias)}.*`,
      // 		// 	selection: [],
      // 		// 	isJson: false,
      // 		// 	relationTableTsKey: undefined,
      // 		// }];
      // 		// const newSelectionItem: (typeof selection)[number] = {
      // 		// 	dbKey: selectedRelationTsKey,
      // 		// 	tsKey: selectedRelationTsKey,
      // 		// 	field,
      // 		// 	relationTableTsKey: relationTableTsName,
      // 		// 	isJson: true,
      // 		// 	selection: builtRelationJoin.selection,
      // 		// };
      // 		// selection.push(newSelectionItem);
      // 		// selectionForBuild.push(newSelectionItem);
      // 		tableFrom = is(builtTableFrom.sql, PgTable)
      // 			? builtTableFrom.sql
      // 			: new Subquery(builtTableFrom.sql, {}, tableAlias);
      // 	}
      // 	if (selectedColumns.length === 0 && selectedRelations.length === 0 && selectedExtras.length === 0) {
      // 		throw new DrizzleError(`No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")`);
      // 	}
      // 	let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'];
      // 	function prepareSelectedColumns() {
      // 		return selectedColumns.map((key) => ({
      // 			dbKey: tableConfig.columns[key]!.name,
      // 			tsKey: key,
      // 			field: tableConfig.columns[key] as PgColumn,
      // 			relationTableTsKey: undefined,
      // 			isJson: false,
      // 			selection: [],
      // 		}));
      // 	}
      // 	function prepareSelectedExtras() {
      // 		return selectedExtras.map((item) => ({
      // 			dbKey: item.value.fieldAlias,
      // 			tsKey: item.tsKey,
      // 			field: item.value,
      // 			relationTableTsKey: undefined,
      // 			isJson: false,
      // 			selection: [],
      // 		}));
      // 	}
      // 	if (isRoot) {
      // 		selection = [
      // 			...prepareSelectedColumns(),
      // 			...prepareSelectedExtras(),
      // 		];
      // 	}
      // 	if (hasUserDefinedWhere || orderBy.length > 0) {
      // 		tableFrom = new Subquery(
      // 			this.buildSelectQuery({
      // 				table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
      // 				fields: {},
      // 				fieldsFlat: selectionForBuild.map(({ field }) => ({
      // 					path: [],
      // 					field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
      // 				})),
      // 				joins,
      // 				distinct,
      // 			}),
      // 			{},
      // 			tableAlias,
      // 		);
      // 		selectionForBuild = selection.map((item) =>
      // 			is(item.field, SQL.Aliased)
      // 				? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
      // 				: item
      // 		);
      // 		joins = [];
      // 		distinct = undefined;
      // 	}
      // 	const result = this.buildSelectQuery({
      // 		table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
      // 		fields: {},
      // 		fieldsFlat: selectionForBuild.map(({ field }) => ({
      // 			path: [],
      // 			field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
      // 		})),
      // 		where,
      // 		limit,
      // 		offset,
      // 		joins,
      // 		orderBy,
      // 		distinct,
      // 	});
      // 	return {
      // 		tableTsKey: tableConfig.tsName,
      // 		sql: result,
      // 		selection,
      // 	};
      // }
      buildRelationalQueryWithoutPK({
        fullSchema,
        schema,
        tableNamesMap,
        table,
        tableConfig,
        queryConfig: config,
        tableAlias,
        nestedQueryRelation,
        joinOn
      }) {
        let selection = [];
        let limit, offset, orderBy = [], where;
        const joins = [];
        if (config === true) {
          const selectionEntries = Object.entries(tableConfig.columns);
          selection = selectionEntries.map(([key, value]) => ({
            dbKey: value.name,
            tsKey: key,
            field: aliasedTableColumn(value, tableAlias),
            relationTableTsKey: void 0,
            isJson: false,
            selection: []
          }));
        } else {
          const aliasedColumns = Object.fromEntries(
            Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
          );
          if (config.where) {
            const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
            where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
          }
          const fieldsSelection = [];
          let selectedColumns = [];
          if (config.columns) {
            let isIncludeMode = false;
            for (const [field, value] of Object.entries(config.columns)) {
              if (value === void 0) {
                continue;
              }
              if (field in tableConfig.columns) {
                if (!isIncludeMode && value === true) {
                  isIncludeMode = true;
                }
                selectedColumns.push(field);
              }
            }
            if (selectedColumns.length > 0) {
              selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
            }
          } else {
            selectedColumns = Object.keys(tableConfig.columns);
          }
          for (const field of selectedColumns) {
            const column = tableConfig.columns[field];
            fieldsSelection.push({ tsKey: field, value: column });
          }
          let selectedRelations = [];
          if (config.with) {
            selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
          }
          let extras;
          if (config.extras) {
            extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
            for (const [tsKey, value] of Object.entries(extras)) {
              fieldsSelection.push({
                tsKey,
                value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
              });
            }
          }
          for (const { tsKey, value } of fieldsSelection) {
            selection.push({
              dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
              tsKey,
              field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
              relationTableTsKey: void 0,
              isJson: false,
              selection: []
            });
          }
          let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
          if (!Array.isArray(orderByOrig)) {
            orderByOrig = [orderByOrig];
          }
          orderBy = orderByOrig.map((orderByValue) => {
            if (is(orderByValue, Column)) {
              return aliasedTableColumn(orderByValue, tableAlias);
            }
            return mapColumnsInSQLToAlias(orderByValue, tableAlias);
          });
          limit = config.limit;
          offset = config.offset;
          for (const {
            tsKey: selectedRelationTsKey,
            queryConfig: selectedRelationConfigValue,
            relation
          } of selectedRelations) {
            const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
            const relationTableName = getTableUniqueName(relation.referencedTable);
            const relationTableTsName = tableNamesMap[relationTableName];
            const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
            const joinOn2 = and(
              ...normalizedRelation.fields.map(
                (field2, i) => eq(
                  aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
                  aliasedTableColumn(field2, tableAlias)
                )
              )
            );
            const builtRelation = this.buildRelationalQueryWithoutPK({
              fullSchema,
              schema,
              tableNamesMap,
              table: fullSchema[relationTableTsName],
              tableConfig: schema[relationTableTsName],
              queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
              tableAlias: relationTableAlias,
              joinOn: joinOn2,
              nestedQueryRelation: relation
            });
            const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
            joins.push({
              on: sql`true`,
              table: new Subquery(builtRelation.sql, {}, relationTableAlias),
              alias: relationTableAlias,
              joinType: "left",
              lateral: true
            });
            selection.push({
              dbKey: selectedRelationTsKey,
              tsKey: selectedRelationTsKey,
              field,
              relationTableTsKey: relationTableTsName,
              isJson: true,
              selection: builtRelation.selection
            });
          }
        }
        if (selection.length === 0) {
          throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
        }
        let result;
        where = and(joinOn, where);
        if (nestedQueryRelation) {
          let field = sql`json_build_array(${sql.join(
            selection.map(
              ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
            ),
            sql`, `
          )})`;
          if (is(nestedQueryRelation, Many)) {
            field = sql`coalesce(json_agg(${field}${orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0}), '[]'::json)`;
          }
          const nestedSelection = [{
            dbKey: "data",
            tsKey: "data",
            field: field.as("data"),
            isJson: true,
            relationTableTsKey: tableConfig.tsName,
            selection
          }];
          const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
          if (needsSubquery) {
            result = this.buildSelectQuery({
              table: aliasedTable(table, tableAlias),
              fields: {},
              fieldsFlat: [{
                path: [],
                field: sql.raw("*")
              }],
              where,
              limit,
              offset,
              orderBy,
              setOperators: []
            });
            where = void 0;
            limit = void 0;
            offset = void 0;
            orderBy = [];
          } else {
            result = aliasedTable(table, tableAlias);
          }
          result = this.buildSelectQuery({
            table: is(result, PgTable) ? result : new Subquery(result, {}, tableAlias),
            fields: {},
            fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
              path: [],
              field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
            })),
            joins,
            where,
            limit,
            offset,
            orderBy,
            setOperators: []
          });
        } else {
          result = this.buildSelectQuery({
            table: aliasedTable(table, tableAlias),
            fields: {},
            fieldsFlat: selection.map(({ field }) => ({
              path: [],
              field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
            })),
            joins,
            where,
            limit,
            offset,
            orderBy,
            setOperators: []
          });
        }
        return {
          tableTsKey: tableConfig.tsName,
          sql: result,
          selection
        };
      }
    };
  }
});

// node_modules/drizzle-orm/query-builders/query-builder.js
var TypedQueryBuilder;
var init_query_builder = __esm({
  "node_modules/drizzle-orm/query-builders/query-builder.js"() {
    init_entity();
    TypedQueryBuilder = class {
      static [entityKind] = "TypedQueryBuilder";
      /** @internal */
      getSelectedFields() {
        return this._.selectedFields;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/select.js
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select2) => ({
      type,
      isAll,
      rightSelect: select2
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
var PgSelectBuilder, PgSelectQueryBuilderBase, PgSelectBase, getPgSetOperators, union, unionAll, intersect, intersectAll, except, exceptAll;
var init_select2 = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/select.js"() {
    init_entity();
    init_view_base();
    init_query_builder();
    init_query_promise();
    init_selection_proxy();
    init_sql();
    init_subquery();
    init_table();
    init_tracing();
    init_utils();
    init_utils();
    init_view_common();
    init_utils3();
    PgSelectBuilder = class {
      static [entityKind] = "PgSelectBuilder";
      fields;
      session;
      dialect;
      withList = [];
      distinct;
      constructor(config) {
        this.fields = config.fields;
        this.session = config.session;
        this.dialect = config.dialect;
        if (config.withList) {
          this.withList = config.withList;
        }
        this.distinct = config.distinct;
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      /**
       * Specify the table, subquery, or other target that you're
       * building a select query against.
       *
       * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM | Postgres from documentation}
       */
      from(source) {
        const isPartialSelect = !!this.fields;
        const src = source;
        let fields;
        if (this.fields) {
          fields = this.fields;
        } else if (is(src, Subquery)) {
          fields = Object.fromEntries(
            Object.keys(src._.selectedFields).map((key) => [key, src[key]])
          );
        } else if (is(src, PgViewBase)) {
          fields = src[ViewBaseConfig].selectedFields;
        } else if (is(src, SQL)) {
          fields = {};
        } else {
          fields = getTableColumns(src);
        }
        return new PgSelectBase({
          table: src,
          fields,
          isPartialSelect,
          session: this.session,
          dialect: this.dialect,
          withList: this.withList,
          distinct: this.distinct
        }).setToken(this.authToken);
      }
    };
    PgSelectQueryBuilderBase = class extends TypedQueryBuilder {
      static [entityKind] = "PgSelectQueryBuilder";
      _;
      config;
      joinsNotNullableMap;
      tableName;
      isPartialSelect;
      session;
      dialect;
      cacheConfig = void 0;
      usedTables = /* @__PURE__ */ new Set();
      constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
        super();
        this.config = {
          withList,
          table,
          fields: { ...fields },
          distinct,
          setOperators: []
        };
        this.isPartialSelect = isPartialSelect;
        this.session = session;
        this.dialect = dialect;
        this._ = {
          selectedFields: fields,
          config: this.config
        };
        this.tableName = getTableLikeName(table);
        this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
        for (const item of extractUsedTable(table)) this.usedTables.add(item);
      }
      /** @internal */
      getUsedTables() {
        return [...this.usedTables];
      }
      createJoin(joinType, lateral) {
        return (table, on) => {
          const baseTableName = this.tableName;
          const tableName = getTableLikeName(table);
          for (const item of extractUsedTable(table)) this.usedTables.add(item);
          if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
            throw new Error(`Alias "${tableName}" is already used in this query`);
          }
          if (!this.isPartialSelect) {
            if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
              this.config.fields = {
                [baseTableName]: this.config.fields
              };
            }
            if (typeof tableName === "string" && !is(table, SQL)) {
              const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
              this.config.fields[tableName] = selection;
            }
          }
          if (typeof on === "function") {
            on = on(
              new Proxy(
                this.config.fields,
                new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              )
            );
          }
          if (!this.config.joins) {
            this.config.joins = [];
          }
          this.config.joins.push({ on, table, joinType, alias: tableName, lateral });
          if (typeof tableName === "string") {
            switch (joinType) {
              case "left": {
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
              case "right": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "cross":
              case "inner": {
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "full": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
            }
          }
          return this;
        };
      }
      /**
       * Executes a `left join` operation by adding another table to the current query.
       *
       * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
       *   .from(users)
       *   .leftJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .leftJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      leftJoin = this.createJoin("left", false);
      /**
       * Executes a `left join lateral` operation by adding subquery to the current query.
       *
       * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
       *
       * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#left-join-lateral}
       *
       * @param table the subquery to join.
       * @param on the `on` clause.
       */
      leftJoinLateral = this.createJoin("left", true);
      /**
       * Executes a `right join` operation by adding another table to the current query.
       *
       * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .rightJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .rightJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      rightJoin = this.createJoin("right", false);
      /**
       * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
       *
       * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .innerJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .innerJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      innerJoin = this.createJoin("inner", false);
      /**
       * Executes an `inner join lateral` operation, creating a new table by combining rows from two queries that have matching values.
       *
       * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
       *
       * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join-lateral}
       *
       * @param table the subquery to join.
       * @param on the `on` clause.
       */
      innerJoinLateral = this.createJoin("inner", true);
      /**
       * Executes a `full join` operation by combining rows from two tables into a new table.
       *
       * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
       *
       * @param table the table to join.
       * @param on the `on` clause.
       *
       * @example
       *
       * ```ts
       * // Select all users and their pets
       * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
       *   .from(users)
       *   .fullJoin(pets, eq(users.id, pets.ownerId))
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .fullJoin(pets, eq(users.id, pets.ownerId))
       * ```
       */
      fullJoin = this.createJoin("full", false);
      /**
       * Executes a `cross join` operation by combining rows from two tables into a new table.
       *
       * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
       *
       * @param table the table to join.
       *
       * @example
       *
       * ```ts
       * // Select all users, each user with every pet
       * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
       *   .from(users)
       *   .crossJoin(pets)
       *
       * // Select userId and petId
       * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
       *   userId: users.id,
       *   petId: pets.id,
       * })
       *   .from(users)
       *   .crossJoin(pets)
       * ```
       */
      crossJoin = this.createJoin("cross", false);
      /**
       * Executes a `cross join lateral` operation by combining rows from two queries into a new table.
       *
       * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
       *
       * Calling this method retrieves all rows from both main and joined queries, merging all rows from each query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join-lateral}
       *
       * @param table the query to join.
       */
      crossJoinLateral = this.createJoin("cross", true);
      createSetOperator(type, isAll) {
        return (rightSelection) => {
          const rightSelect = typeof rightSelection === "function" ? rightSelection(getPgSetOperators()) : rightSelection;
          if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
            throw new Error(
              "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
            );
          }
          this.config.setOperators.push({ type, isAll, rightSelect });
          return this;
        };
      }
      /**
       * Adds `union` set operator to the query.
       *
       * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
       *
       * @example
       *
       * ```ts
       * // Select all unique names from customers and users tables
       * await db.select({ name: users.name })
       *   .from(users)
       *   .union(
       *     db.select({ name: customers.name }).from(customers)
       *   );
       * // or
       * import { union } from 'drizzle-orm/pg-core'
       *
       * await union(
       *   db.select({ name: users.name }).from(users),
       *   db.select({ name: customers.name }).from(customers)
       * );
       * ```
       */
      union = this.createSetOperator("union", false);
      /**
       * Adds `union all` set operator to the query.
       *
       * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
       *
       * @example
       *
       * ```ts
       * // Select all transaction ids from both online and in-store sales
       * await db.select({ transaction: onlineSales.transactionId })
       *   .from(onlineSales)
       *   .unionAll(
       *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
       *   );
       * // or
       * import { unionAll } from 'drizzle-orm/pg-core'
       *
       * await unionAll(
       *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
       *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
       * );
       * ```
       */
      unionAll = this.createSetOperator("union", true);
      /**
       * Adds `intersect` set operator to the query.
       *
       * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
       *
       * @example
       *
       * ```ts
       * // Select course names that are offered in both departments A and B
       * await db.select({ courseName: depA.courseName })
       *   .from(depA)
       *   .intersect(
       *     db.select({ courseName: depB.courseName }).from(depB)
       *   );
       * // or
       * import { intersect } from 'drizzle-orm/pg-core'
       *
       * await intersect(
       *   db.select({ courseName: depA.courseName }).from(depA),
       *   db.select({ courseName: depB.courseName }).from(depB)
       * );
       * ```
       */
      intersect = this.createSetOperator("intersect", false);
      /**
       * Adds `intersect all` set operator to the query.
       *
       * Calling this method will retain only the rows that are present in both result sets including all duplicates.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
       *
       * @example
       *
       * ```ts
       * // Select all products and quantities that are ordered by both regular and VIP customers
       * await db.select({
       *   productId: regularCustomerOrders.productId,
       *   quantityOrdered: regularCustomerOrders.quantityOrdered
       * })
       * .from(regularCustomerOrders)
       * .intersectAll(
       *   db.select({
       *     productId: vipCustomerOrders.productId,
       *     quantityOrdered: vipCustomerOrders.quantityOrdered
       *   })
       *   .from(vipCustomerOrders)
       * );
       * // or
       * import { intersectAll } from 'drizzle-orm/pg-core'
       *
       * await intersectAll(
       *   db.select({
       *     productId: regularCustomerOrders.productId,
       *     quantityOrdered: regularCustomerOrders.quantityOrdered
       *   })
       *   .from(regularCustomerOrders),
       *   db.select({
       *     productId: vipCustomerOrders.productId,
       *     quantityOrdered: vipCustomerOrders.quantityOrdered
       *   })
       *   .from(vipCustomerOrders)
       * );
       * ```
       */
      intersectAll = this.createSetOperator("intersect", true);
      /**
       * Adds `except` set operator to the query.
       *
       * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
       *
       * @example
       *
       * ```ts
       * // Select all courses offered in department A but not in department B
       * await db.select({ courseName: depA.courseName })
       *   .from(depA)
       *   .except(
       *     db.select({ courseName: depB.courseName }).from(depB)
       *   );
       * // or
       * import { except } from 'drizzle-orm/pg-core'
       *
       * await except(
       *   db.select({ courseName: depA.courseName }).from(depA),
       *   db.select({ courseName: depB.courseName }).from(depB)
       * );
       * ```
       */
      except = this.createSetOperator("except", false);
      /**
       * Adds `except all` set operator to the query.
       *
       * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
       *
       * @example
       *
       * ```ts
       * // Select all products that are ordered by regular customers but not by VIP customers
       * await db.select({
       *   productId: regularCustomerOrders.productId,
       *   quantityOrdered: regularCustomerOrders.quantityOrdered,
       * })
       * .from(regularCustomerOrders)
       * .exceptAll(
       *   db.select({
       *     productId: vipCustomerOrders.productId,
       *     quantityOrdered: vipCustomerOrders.quantityOrdered,
       *   })
       *   .from(vipCustomerOrders)
       * );
       * // or
       * import { exceptAll } from 'drizzle-orm/pg-core'
       *
       * await exceptAll(
       *   db.select({
       *     productId: regularCustomerOrders.productId,
       *     quantityOrdered: regularCustomerOrders.quantityOrdered
       *   })
       *   .from(regularCustomerOrders),
       *   db.select({
       *     productId: vipCustomerOrders.productId,
       *     quantityOrdered: vipCustomerOrders.quantityOrdered
       *   })
       *   .from(vipCustomerOrders)
       * );
       * ```
       */
      exceptAll = this.createSetOperator("except", true);
      /** @internal */
      addSetOperators(setOperators) {
        this.config.setOperators.push(...setOperators);
        return this;
      }
      /**
       * Adds a `where` clause to the query.
       *
       * Calling this method will select only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
       *
       * @param where the `where` clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be selected.
       *
       * ```ts
       * // Select all cars with green color
       * await db.select().from(cars).where(eq(cars.color, 'green'));
       * // or
       * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Select all BMW cars with a green color
       * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Select all cars with the green or blue color
       * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        if (typeof where === "function") {
          where = where(
            new Proxy(
              this.config.fields,
              new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
            )
          );
        }
        this.config.where = where;
        return this;
      }
      /**
       * Adds a `having` clause to the query.
       *
       * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
       *
       * @param having the `having` clause.
       *
       * @example
       *
       * ```ts
       * // Select all brands with more than one car
       * await db.select({
       * 	brand: cars.brand,
       * 	count: sql<number>`cast(count(${cars.id}) as int)`,
       * })
       *   .from(cars)
       *   .groupBy(cars.brand)
       *   .having(({ count }) => gt(count, 1));
       * ```
       */
      having(having) {
        if (typeof having === "function") {
          having = having(
            new Proxy(
              this.config.fields,
              new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
            )
          );
        }
        this.config.having = having;
        return this;
      }
      groupBy(...columns) {
        if (typeof columns[0] === "function") {
          const groupBy = columns[0](
            new Proxy(
              this.config.fields,
              new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
        } else {
          this.config.groupBy = columns;
        }
        return this;
      }
      orderBy(...columns) {
        if (typeof columns[0] === "function") {
          const orderBy = columns[0](
            new Proxy(
              this.config.fields,
              new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
            )
          );
          const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
          if (this.config.setOperators.length > 0) {
            this.config.setOperators.at(-1).orderBy = orderByArray;
          } else {
            this.config.orderBy = orderByArray;
          }
        } else {
          const orderByArray = columns;
          if (this.config.setOperators.length > 0) {
            this.config.setOperators.at(-1).orderBy = orderByArray;
          } else {
            this.config.orderBy = orderByArray;
          }
        }
        return this;
      }
      /**
       * Adds a `limit` clause to the query.
       *
       * Calling this method will set the maximum number of rows that will be returned by this query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
       *
       * @param limit the `limit` clause.
       *
       * @example
       *
       * ```ts
       * // Get the first 10 people from this query.
       * await db.select().from(people).limit(10);
       * ```
       */
      limit(limit) {
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).limit = limit;
        } else {
          this.config.limit = limit;
        }
        return this;
      }
      /**
       * Adds an `offset` clause to the query.
       *
       * Calling this method will skip a number of rows when returning results from this query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
       *
       * @param offset the `offset` clause.
       *
       * @example
       *
       * ```ts
       * // Get the 10th-20th people from this query.
       * await db.select().from(people).offset(10).limit(10);
       * ```
       */
      offset(offset) {
        if (this.config.setOperators.length > 0) {
          this.config.setOperators.at(-1).offset = offset;
        } else {
          this.config.offset = offset;
        }
        return this;
      }
      /**
       * Adds a `for` clause to the query.
       *
       * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
       *
       * See docs: {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE}
       *
       * @param strength the lock strength.
       * @param config the lock configuration.
       */
      for(strength, config = {}) {
        this.config.lockingClause = { strength, config };
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildSelectQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      as(alias) {
        const usedTables = [];
        usedTables.push(...extractUsedTable(this.config.table));
        if (this.config.joins) {
          for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
        }
        return new Proxy(
          new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
      /** @internal */
      getSelectedFields() {
        return new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
      $dynamic() {
        return this;
      }
      $withCache(config) {
        this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
        return this;
      }
    };
    PgSelectBase = class extends PgSelectQueryBuilderBase {
      static [entityKind] = "PgSelect";
      /** @internal */
      _prepare(name) {
        const { session, config, dialect, joinsNotNullableMap, authToken, cacheConfig, usedTables } = this;
        if (!session) {
          throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
        }
        const { fields } = config;
        return tracer.startActiveSpan("drizzle.prepareQuery", () => {
          const fieldsList = orderSelectedFields(fields);
          const query = session.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name, true, void 0, {
            type: "select",
            tables: [...usedTables]
          }, cacheConfig);
          query.joinsNotNullableMap = joinsNotNullableMap;
          return query.setToken(authToken);
        });
      }
      /**
       * Create a prepared statement for this query. This allows
       * the database to remember this query for the given session
       * and call it by name, rather than specifying the full query.
       *
       * {@link https://www.postgresql.org/docs/current/sql-prepare.html | Postgres prepare documentation}
       */
      prepare(name) {
        return this._prepare(name);
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute = (placeholderValues) => {
        return tracer.startActiveSpan("drizzle.operation", () => {
          return this._prepare().execute(placeholderValues, this.authToken);
        });
      };
    };
    applyMixins(PgSelectBase, [QueryPromise]);
    getPgSetOperators = () => ({
      union,
      unionAll,
      intersect,
      intersectAll,
      except,
      exceptAll
    });
    union = createSetOperator("union", false);
    unionAll = createSetOperator("union", true);
    intersect = createSetOperator("intersect", false);
    intersectAll = createSetOperator("intersect", true);
    except = createSetOperator("except", false);
    exceptAll = createSetOperator("except", true);
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/query-builder.js
var QueryBuilder;
var init_query_builder2 = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/query-builder.js"() {
    init_entity();
    init_dialect();
    init_selection_proxy();
    init_subquery();
    init_select2();
    QueryBuilder = class {
      static [entityKind] = "PgQueryBuilder";
      dialect;
      dialectConfig;
      constructor(dialect) {
        this.dialect = is(dialect, PgDialect) ? dialect : void 0;
        this.dialectConfig = is(dialect, PgDialect) ? void 0 : dialect;
      }
      $with = (alias, selection) => {
        const queryBuilder = this;
        const as = (qb) => {
          if (typeof qb === "function") {
            qb = qb(queryBuilder);
          }
          return new Proxy(
            new WithSubquery(
              qb.getSQL(),
              selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
              alias,
              true
            ),
            new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
          );
        };
        return { as };
      };
      with(...queries) {
        const self = this;
        function select2(fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: void 0,
            dialect: self.getDialect(),
            withList: queries
          });
        }
        function selectDistinct(fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: void 0,
            dialect: self.getDialect(),
            distinct: true
          });
        }
        function selectDistinctOn(on, fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: void 0,
            dialect: self.getDialect(),
            distinct: { on }
          });
        }
        return { select: select2, selectDistinct, selectDistinctOn };
      }
      select(fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: void 0,
          dialect: this.getDialect()
        });
      }
      selectDistinct(fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: void 0,
          dialect: this.getDialect(),
          distinct: true
        });
      }
      selectDistinctOn(on, fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: void 0,
          dialect: this.getDialect(),
          distinct: { on }
        });
      }
      // Lazy load dialect to avoid circular dependency
      getDialect() {
        if (!this.dialect) {
          this.dialect = new PgDialect(this.dialectConfig);
        }
        return this.dialect;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/view.js
function pgViewWithSchema(name, selection, schema) {
  if (selection) {
    return new ManualViewBuilder(name, selection, schema);
  }
  return new ViewBuilder(name, schema);
}
function pgMaterializedViewWithSchema(name, selection, schema) {
  if (selection) {
    return new ManualMaterializedViewBuilder(name, selection, schema);
  }
  return new MaterializedViewBuilder(name, schema);
}
var DefaultViewBuilderCore, ViewBuilder, ManualViewBuilder, MaterializedViewBuilderCore, MaterializedViewBuilder, ManualMaterializedViewBuilder, PgView, PgMaterializedViewConfig, PgMaterializedView;
var init_view = __esm({
  "node_modules/drizzle-orm/pg-core/view.js"() {
    init_entity();
    init_selection_proxy();
    init_utils();
    init_query_builder2();
    init_table2();
    init_view_base();
    init_view_common2();
    DefaultViewBuilderCore = class {
      constructor(name, schema) {
        this.name = name;
        this.schema = schema;
      }
      static [entityKind] = "PgDefaultViewBuilderCore";
      config = {};
      with(config) {
        this.config.with = config;
        return this;
      }
    };
    ViewBuilder = class extends DefaultViewBuilderCore {
      static [entityKind] = "PgViewBuilder";
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder());
        }
        const selectionProxy = new SelectionProxyHandler({
          alias: this.name,
          sqlBehavior: "error",
          sqlAliasedBehavior: "alias",
          replaceOriginalName: true
        });
        const aliasedSelection = new Proxy(qb.getSelectedFields(), selectionProxy);
        return new Proxy(
          new PgView({
            pgConfig: this.config,
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: aliasedSelection,
              query: qb.getSQL().inlineParams()
            }
          }),
          selectionProxy
        );
      }
    };
    ManualViewBuilder = class extends DefaultViewBuilderCore {
      static [entityKind] = "PgManualViewBuilder";
      columns;
      constructor(name, columns, schema) {
        super(name, schema);
        this.columns = getTableColumns(pgTable(name, columns));
      }
      existing() {
        return new Proxy(
          new PgView({
            pgConfig: void 0,
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: this.columns,
              query: void 0
            }
          }),
          new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
      as(query) {
        return new Proxy(
          new PgView({
            pgConfig: this.config,
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: this.columns,
              query: query.inlineParams()
            }
          }),
          new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
    };
    MaterializedViewBuilderCore = class {
      constructor(name, schema) {
        this.name = name;
        this.schema = schema;
      }
      static [entityKind] = "PgMaterializedViewBuilderCore";
      config = {};
      using(using) {
        this.config.using = using;
        return this;
      }
      with(config) {
        this.config.with = config;
        return this;
      }
      tablespace(tablespace) {
        this.config.tablespace = tablespace;
        return this;
      }
      withNoData() {
        this.config.withNoData = true;
        return this;
      }
    };
    MaterializedViewBuilder = class extends MaterializedViewBuilderCore {
      static [entityKind] = "PgMaterializedViewBuilder";
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder());
        }
        const selectionProxy = new SelectionProxyHandler({
          alias: this.name,
          sqlBehavior: "error",
          sqlAliasedBehavior: "alias",
          replaceOriginalName: true
        });
        const aliasedSelection = new Proxy(qb.getSelectedFields(), selectionProxy);
        return new Proxy(
          new PgMaterializedView({
            pgConfig: {
              with: this.config.with,
              using: this.config.using,
              tablespace: this.config.tablespace,
              withNoData: this.config.withNoData
            },
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: aliasedSelection,
              query: qb.getSQL().inlineParams()
            }
          }),
          selectionProxy
        );
      }
    };
    ManualMaterializedViewBuilder = class extends MaterializedViewBuilderCore {
      static [entityKind] = "PgManualMaterializedViewBuilder";
      columns;
      constructor(name, columns, schema) {
        super(name, schema);
        this.columns = getTableColumns(pgTable(name, columns));
      }
      existing() {
        return new Proxy(
          new PgMaterializedView({
            pgConfig: {
              tablespace: this.config.tablespace,
              using: this.config.using,
              with: this.config.with,
              withNoData: this.config.withNoData
            },
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: this.columns,
              query: void 0
            }
          }),
          new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
      as(query) {
        return new Proxy(
          new PgMaterializedView({
            pgConfig: {
              tablespace: this.config.tablespace,
              using: this.config.using,
              with: this.config.with,
              withNoData: this.config.withNoData
            },
            config: {
              name: this.name,
              schema: this.schema,
              selectedFields: this.columns,
              query: query.inlineParams()
            }
          }),
          new SelectionProxyHandler({
            alias: this.name,
            sqlBehavior: "error",
            sqlAliasedBehavior: "alias",
            replaceOriginalName: true
          })
        );
      }
    };
    PgView = class extends PgViewBase {
      static [entityKind] = "PgView";
      [PgViewConfig];
      constructor({ pgConfig, config }) {
        super(config);
        if (pgConfig) {
          this[PgViewConfig] = {
            with: pgConfig.with
          };
        }
      }
    };
    PgMaterializedViewConfig = /* @__PURE__ */ Symbol.for("drizzle:PgMaterializedViewConfig");
    PgMaterializedView = class extends PgViewBase {
      static [entityKind] = "PgMaterializedView";
      [PgMaterializedViewConfig];
      constructor({ pgConfig, config }) {
        super(config);
        this[PgMaterializedViewConfig] = {
          with: pgConfig?.with,
          using: pgConfig?.using,
          tablespace: pgConfig?.tablespace,
          withNoData: pgConfig?.withNoData
        };
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/utils.js
function extractUsedTable(table) {
  if (is(table, PgTable)) {
    return [table[Schema] ? `${table[Schema]}.${table[Table.Symbol.BaseName]}` : table[Table.Symbol.BaseName]];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}
var init_utils3 = __esm({
  "node_modules/drizzle-orm/pg-core/utils.js"() {
    init_entity();
    init_table2();
    init_sql();
    init_subquery();
    init_table();
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/delete.js
var PgDeleteBase;
var init_delete = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/delete.js"() {
    init_entity();
    init_query_promise();
    init_selection_proxy();
    init_table();
    init_tracing();
    init_utils();
    init_utils3();
    PgDeleteBase = class extends QueryPromise {
      constructor(table, session, dialect, withList) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, withList };
      }
      static [entityKind] = "PgDelete";
      config;
      cacheConfig;
      /**
       * Adds a `where` clause to the query.
       *
       * Calling this method will delete only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/delete}
       *
       * @param where the `where` clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be deleted.
       *
       * ```ts
       * // Delete all cars with green color
       * await db.delete(cars).where(eq(cars.color, 'green'));
       * // or
       * await db.delete(cars).where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Delete all BMW cars with a green color
       * await db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Delete all cars with the green or blue color
       * await db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        this.config.where = where;
        return this;
      }
      returning(fields = this.config.table[Table.Symbol.Columns]) {
        this.config.returningFields = fields;
        this.config.returning = orderSelectedFields(fields);
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildDeleteQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(name) {
        return tracer.startActiveSpan("drizzle.prepareQuery", () => {
          return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
            type: "delete",
            tables: extractUsedTable(this.config.table)
          }, this.cacheConfig);
        });
      }
      prepare(name) {
        return this._prepare(name);
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute = (placeholderValues) => {
        return tracer.startActiveSpan("drizzle.operation", () => {
          return this._prepare().execute(placeholderValues, this.authToken);
        });
      };
      /** @internal */
      getSelectedFields() {
        return this.config.returningFields ? new Proxy(
          this.config.returningFields,
          new SelectionProxyHandler({
            alias: getTableName(this.config.table),
            sqlAliasedBehavior: "alias",
            sqlBehavior: "error"
          })
        ) : void 0;
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/insert.js
var PgInsertBuilder, PgInsertBase;
var init_insert = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/insert.js"() {
    init_entity();
    init_query_promise();
    init_selection_proxy();
    init_sql();
    init_table();
    init_tracing();
    init_utils();
    init_utils3();
    init_query_builder2();
    PgInsertBuilder = class {
      constructor(table, session, dialect, withList, overridingSystemValue_) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.withList = withList;
        this.overridingSystemValue_ = overridingSystemValue_;
      }
      static [entityKind] = "PgInsertBuilder";
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      overridingSystemValue() {
        this.overridingSystemValue_ = true;
        return this;
      }
      values(values2) {
        values2 = Array.isArray(values2) ? values2 : [values2];
        if (values2.length === 0) {
          throw new Error("values() must be called with at least one value");
        }
        const mappedValues = values2.map((entry) => {
          const result = {};
          const cols = this.table[Table.Symbol.Columns];
          for (const colKey of Object.keys(entry)) {
            const colValue = entry[colKey];
            result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
          }
          return result;
        });
        return new PgInsertBase(
          this.table,
          mappedValues,
          this.session,
          this.dialect,
          this.withList,
          false,
          this.overridingSystemValue_
        ).setToken(this.authToken);
      }
      select(selectQuery) {
        const select2 = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
        if (!is(select2, SQL) && !haveSameKeys(this.table[Columns], select2._.selectedFields)) {
          throw new Error(
            "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
          );
        }
        return new PgInsertBase(this.table, select2, this.session, this.dialect, this.withList, true);
      }
    };
    PgInsertBase = class extends QueryPromise {
      constructor(table, values2, session, dialect, withList, select2, overridingSystemValue_) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { table, values: values2, withList, select: select2, overridingSystemValue_ };
      }
      static [entityKind] = "PgInsert";
      config;
      cacheConfig;
      returning(fields = this.config.table[Table.Symbol.Columns]) {
        this.config.returningFields = fields;
        this.config.returning = orderSelectedFields(fields);
        return this;
      }
      /**
       * Adds an `on conflict do nothing` clause to the query.
       *
       * Calling this method simply avoids inserting a row as its alternative action.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
       *
       * @param config The `target` and `where` clauses.
       *
       * @example
       * ```ts
       * // Insert one row and cancel the insert if there's a conflict
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoNothing();
       *
       * // Explicitly specify conflict target
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoNothing({ target: cars.id });
       * ```
       */
      onConflictDoNothing(config = {}) {
        if (config.target === void 0) {
          this.config.onConflict = sql`do nothing`;
        } else {
          let targetColumn = "";
          targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
          const whereSql = config.where ? sql` where ${config.where}` : void 0;
          this.config.onConflict = sql`(${sql.raw(targetColumn)})${whereSql} do nothing`;
        }
        return this;
      }
      /**
       * Adds an `on conflict do update` clause to the query.
       *
       * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
       *
       * @param config The `target`, `set` and `where` clauses.
       *
       * @example
       * ```ts
       * // Update the row if there's a conflict
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoUpdate({
       *     target: cars.id,
       *     set: { brand: 'Porsche' }
       *   });
       *
       * // Upsert with 'where' clause
       * await db.insert(cars)
       *   .values({ id: 1, brand: 'BMW' })
       *   .onConflictDoUpdate({
       *     target: cars.id,
       *     set: { brand: 'newBMW' },
       *     targetWhere: sql`${cars.createdAt} > '2023-01-01'::date`,
       *   });
       * ```
       */
      onConflictDoUpdate(config) {
        if (config.where && (config.targetWhere || config.setWhere)) {
          throw new Error(
            'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
          );
        }
        const whereSql = config.where ? sql` where ${config.where}` : void 0;
        const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
        const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
        const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
        let targetColumn = "";
        targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
        this.config.onConflict = sql`(${sql.raw(targetColumn)})${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`;
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildInsertQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(name) {
        return tracer.startActiveSpan("drizzle.prepareQuery", () => {
          return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
            type: "insert",
            tables: extractUsedTable(this.config.table)
          }, this.cacheConfig);
        });
      }
      prepare(name) {
        return this._prepare(name);
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute = (placeholderValues) => {
        return tracer.startActiveSpan("drizzle.operation", () => {
          return this._prepare().execute(placeholderValues, this.authToken);
        });
      };
      /** @internal */
      getSelectedFields() {
        return this.config.returningFields ? new Proxy(
          this.config.returningFields,
          new SelectionProxyHandler({
            alias: getTableName(this.config.table),
            sqlAliasedBehavior: "alias",
            sqlBehavior: "error"
          })
        ) : void 0;
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/refresh-materialized-view.js
var PgRefreshMaterializedView;
var init_refresh_materialized_view = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/refresh-materialized-view.js"() {
    init_entity();
    init_query_promise();
    init_tracing();
    PgRefreshMaterializedView = class extends QueryPromise {
      constructor(view, session, dialect) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { view };
      }
      static [entityKind] = "PgRefreshMaterializedView";
      config;
      concurrently() {
        if (this.config.withNoData !== void 0) {
          throw new Error("Cannot use concurrently and withNoData together");
        }
        this.config.concurrently = true;
        return this;
      }
      withNoData() {
        if (this.config.concurrently !== void 0) {
          throw new Error("Cannot use concurrently and withNoData together");
        }
        this.config.withNoData = true;
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildRefreshMaterializedViewQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(name) {
        return tracer.startActiveSpan("drizzle.prepareQuery", () => {
          return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, name, true);
        });
      }
      prepare(name) {
        return this._prepare(name);
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute = (placeholderValues) => {
        return tracer.startActiveSpan("drizzle.operation", () => {
          return this._prepare().execute(placeholderValues, this.authToken);
        });
      };
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/select.types.js
var init_select_types = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/select.types.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/update.js
var PgUpdateBuilder, PgUpdateBase;
var init_update = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/update.js"() {
    init_entity();
    init_table2();
    init_query_promise();
    init_selection_proxy();
    init_sql();
    init_subquery();
    init_table();
    init_utils();
    init_view_common();
    init_utils3();
    PgUpdateBuilder = class {
      constructor(table, session, dialect, withList) {
        this.table = table;
        this.session = session;
        this.dialect = dialect;
        this.withList = withList;
      }
      static [entityKind] = "PgUpdateBuilder";
      authToken;
      setToken(token) {
        this.authToken = token;
        return this;
      }
      set(values2) {
        return new PgUpdateBase(
          this.table,
          mapUpdateSet(this.table, values2),
          this.session,
          this.dialect,
          this.withList
        ).setToken(this.authToken);
      }
    };
    PgUpdateBase = class extends QueryPromise {
      constructor(table, set, session, dialect, withList) {
        super();
        this.session = session;
        this.dialect = dialect;
        this.config = { set, table, withList, joins: [] };
        this.tableName = getTableLikeName(table);
        this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
      }
      static [entityKind] = "PgUpdate";
      config;
      tableName;
      joinsNotNullableMap;
      cacheConfig;
      from(source) {
        const src = source;
        const tableName = getTableLikeName(src);
        if (typeof tableName === "string") {
          this.joinsNotNullableMap[tableName] = true;
        }
        this.config.from = src;
        return this;
      }
      getTableLikeFields(table) {
        if (is(table, PgTable)) {
          return table[Table.Symbol.Columns];
        } else if (is(table, Subquery)) {
          return table._.selectedFields;
        }
        return table[ViewBaseConfig].selectedFields;
      }
      createJoin(joinType) {
        return (table, on) => {
          const tableName = getTableLikeName(table);
          if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
            throw new Error(`Alias "${tableName}" is already used in this query`);
          }
          if (typeof on === "function") {
            const from = this.config.from && !is(this.config.from, SQL) ? this.getTableLikeFields(this.config.from) : void 0;
            on = on(
              new Proxy(
                this.config.table[Table.Symbol.Columns],
                new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              ),
              from && new Proxy(
                from,
                new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
              )
            );
          }
          this.config.joins.push({ on, table, joinType, alias: tableName });
          if (typeof tableName === "string") {
            switch (joinType) {
              case "left": {
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
              case "right": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "inner": {
                this.joinsNotNullableMap[tableName] = true;
                break;
              }
              case "full": {
                this.joinsNotNullableMap = Object.fromEntries(
                  Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
                );
                this.joinsNotNullableMap[tableName] = false;
                break;
              }
            }
          }
          return this;
        };
      }
      leftJoin = this.createJoin("left");
      rightJoin = this.createJoin("right");
      innerJoin = this.createJoin("inner");
      fullJoin = this.createJoin("full");
      /**
       * Adds a 'where' clause to the query.
       *
       * Calling this method will update only those rows that fulfill a specified condition.
       *
       * See docs: {@link https://orm.drizzle.team/docs/update}
       *
       * @param where the 'where' clause.
       *
       * @example
       * You can use conditional operators and `sql function` to filter the rows to be updated.
       *
       * ```ts
       * // Update all cars with green color
       * await db.update(cars).set({ color: 'red' })
       *   .where(eq(cars.color, 'green'));
       * // or
       * await db.update(cars).set({ color: 'red' })
       *   .where(sql`${cars.color} = 'green'`)
       * ```
       *
       * You can logically combine conditional operators with `and()` and `or()` operators:
       *
       * ```ts
       * // Update all BMW cars with a green color
       * await db.update(cars).set({ color: 'red' })
       *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
       *
       * // Update all cars with the green or blue color
       * await db.update(cars).set({ color: 'red' })
       *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
       * ```
       */
      where(where) {
        this.config.where = where;
        return this;
      }
      returning(fields) {
        if (!fields) {
          fields = Object.assign({}, this.config.table[Table.Symbol.Columns]);
          if (this.config.from) {
            const tableName = getTableLikeName(this.config.from);
            if (typeof tableName === "string" && this.config.from && !is(this.config.from, SQL)) {
              const fromFields = this.getTableLikeFields(this.config.from);
              fields[tableName] = fromFields;
            }
            for (const join of this.config.joins) {
              const tableName2 = getTableLikeName(join.table);
              if (typeof tableName2 === "string" && !is(join.table, SQL)) {
                const fromFields = this.getTableLikeFields(join.table);
                fields[tableName2] = fromFields;
              }
            }
          }
        }
        this.config.returningFields = fields;
        this.config.returning = orderSelectedFields(fields);
        return this;
      }
      /** @internal */
      getSQL() {
        return this.dialect.buildUpdateQuery(this.config);
      }
      toSQL() {
        const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
        return rest;
      }
      /** @internal */
      _prepare(name) {
        const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
          type: "insert",
          tables: extractUsedTable(this.config.table)
        }, this.cacheConfig);
        query.joinsNotNullableMap = this.joinsNotNullableMap;
        return query;
      }
      prepare(name) {
        return this._prepare(name);
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute = (placeholderValues) => {
        return this._prepare().execute(placeholderValues, this.authToken);
      };
      /** @internal */
      getSelectedFields() {
        return this.config.returningFields ? new Proxy(
          this.config.returningFields,
          new SelectionProxyHandler({
            alias: getTableName(this.config.table),
            sqlAliasedBehavior: "alias",
            sqlBehavior: "error"
          })
        ) : void 0;
      }
      $dynamic() {
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/index.js
var init_query_builders = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/index.js"() {
    init_delete();
    init_insert();
    init_query_builder2();
    init_refresh_materialized_view();
    init_select2();
    init_select_types();
    init_update();
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/count.js
var PgCountBuilder;
var init_count = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/count.js"() {
    init_entity();
    init_sql();
    PgCountBuilder = class _PgCountBuilder extends SQL {
      constructor(params) {
        super(_PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
        this.params = params;
        this.mapWith(Number);
        this.session = params.session;
        this.sql = _PgCountBuilder.buildCount(
          params.source,
          params.filters
        );
      }
      sql;
      token;
      static [entityKind] = "PgCountBuilder";
      [Symbol.toStringTag] = "PgCountBuilder";
      session;
      static buildEmbeddedCount(source, filters) {
        return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
      }
      static buildCount(source, filters) {
        return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
      }
      /** @intrnal */
      setToken(token) {
        this.token = token;
        return this;
      }
      then(onfulfilled, onrejected) {
        return Promise.resolve(this.session.count(this.sql, this.token)).then(
          onfulfilled,
          onrejected
        );
      }
      catch(onRejected) {
        return this.then(void 0, onRejected);
      }
      finally(onFinally) {
        return this.then(
          (value) => {
            onFinally?.();
            return value;
          },
          (reason) => {
            onFinally?.();
            throw reason;
          }
        );
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/query.js
var RelationalQueryBuilder, PgRelationalQuery;
var init_query2 = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/query.js"() {
    init_entity();
    init_query_promise();
    init_relations();
    init_tracing();
    RelationalQueryBuilder = class {
      constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
        this.fullSchema = fullSchema;
        this.schema = schema;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
      }
      static [entityKind] = "PgRelationalQueryBuilder";
      findMany(config) {
        return new PgRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? config : {},
          "many"
        );
      }
      findFirst(config) {
        return new PgRelationalQuery(
          this.fullSchema,
          this.schema,
          this.tableNamesMap,
          this.table,
          this.tableConfig,
          this.dialect,
          this.session,
          config ? { ...config, limit: 1 } : { limit: 1 },
          "first"
        );
      }
    };
    PgRelationalQuery = class extends QueryPromise {
      constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
        super();
        this.fullSchema = fullSchema;
        this.schema = schema;
        this.tableNamesMap = tableNamesMap;
        this.table = table;
        this.tableConfig = tableConfig;
        this.dialect = dialect;
        this.session = session;
        this.config = config;
        this.mode = mode;
      }
      static [entityKind] = "PgRelationalQuery";
      /** @internal */
      _prepare(name) {
        return tracer.startActiveSpan("drizzle.prepareQuery", () => {
          const { query, builtQuery } = this._toSQL();
          return this.session.prepareQuery(
            builtQuery,
            void 0,
            name,
            true,
            (rawRows, mapColumnValue) => {
              const rows = rawRows.map(
                (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
              );
              if (this.mode === "first") {
                return rows[0];
              }
              return rows;
            }
          );
        });
      }
      prepare(name) {
        return this._prepare(name);
      }
      _getQuery() {
        return this.dialect.buildRelationalQueryWithoutPK({
          fullSchema: this.fullSchema,
          schema: this.schema,
          tableNamesMap: this.tableNamesMap,
          table: this.table,
          tableConfig: this.tableConfig,
          queryConfig: this.config,
          tableAlias: this.tableConfig.tsName
        });
      }
      /** @internal */
      getSQL() {
        return this._getQuery().sql;
      }
      _toSQL() {
        const query = this._getQuery();
        const builtQuery = this.dialect.sqlToQuery(query.sql);
        return { query, builtQuery };
      }
      toSQL() {
        return this._toSQL().builtQuery;
      }
      authToken;
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      execute() {
        return tracer.startActiveSpan("drizzle.operation", () => {
          return this._prepare().execute(void 0, this.authToken);
        });
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/query-builders/raw.js
var PgRaw;
var init_raw = __esm({
  "node_modules/drizzle-orm/pg-core/query-builders/raw.js"() {
    init_entity();
    init_query_promise();
    PgRaw = class extends QueryPromise {
      constructor(execute, sql2, query, mapBatchResult) {
        super();
        this.execute = execute;
        this.sql = sql2;
        this.query = query;
        this.mapBatchResult = mapBatchResult;
      }
      static [entityKind] = "PgRaw";
      /** @internal */
      getSQL() {
        return this.sql;
      }
      getQuery() {
        return this.query;
      }
      mapResult(result, isFromBatch) {
        return isFromBatch ? this.mapBatchResult(result) : result;
      }
      _prepare() {
        return this;
      }
      /** @internal */
      isResponseInArrayMode() {
        return false;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/db.js
var PgDatabase;
var init_db = __esm({
  "node_modules/drizzle-orm/pg-core/db.js"() {
    init_entity();
    init_query_builders();
    init_selection_proxy();
    init_sql();
    init_subquery();
    init_count();
    init_query2();
    init_raw();
    init_refresh_materialized_view();
    PgDatabase = class {
      constructor(dialect, session, schema) {
        this.dialect = dialect;
        this.session = session;
        this._ = schema ? {
          schema: schema.schema,
          fullSchema: schema.fullSchema,
          tableNamesMap: schema.tableNamesMap,
          session
        } : {
          schema: void 0,
          fullSchema: {},
          tableNamesMap: {},
          session
        };
        this.query = {};
        if (this._.schema) {
          for (const [tableName, columns] of Object.entries(this._.schema)) {
            this.query[tableName] = new RelationalQueryBuilder(
              schema.fullSchema,
              this._.schema,
              this._.tableNamesMap,
              schema.fullSchema[tableName],
              columns,
              dialect,
              session
            );
          }
        }
        this.$cache = { invalidate: async (_params) => {
        } };
      }
      static [entityKind] = "PgDatabase";
      query;
      /**
       * Creates a subquery that defines a temporary named result set as a CTE.
       *
       * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
       *
       * @param alias The alias for the subquery.
       *
       * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
       *
       * @example
       *
       * ```ts
       * // Create a subquery with alias 'sq' and use it in the select query
       * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
       *
       * const result = await db.with(sq).select().from(sq);
       * ```
       *
       * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
       *
       * ```ts
       * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
       * const sq = db.$with('sq').as(db.select({
       *   name: sql<string>`upper(${users.name})`.as('name'),
       * })
       * .from(users));
       *
       * const result = await db.with(sq).select({ name: sq.name }).from(sq);
       * ```
       */
      $with = (alias, selection) => {
        const self = this;
        const as = (qb) => {
          if (typeof qb === "function") {
            qb = qb(new QueryBuilder(self.dialect));
          }
          return new Proxy(
            new WithSubquery(
              qb.getSQL(),
              selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
              alias,
              true
            ),
            new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
          );
        };
        return { as };
      };
      $count(source, filters) {
        return new PgCountBuilder({ source, filters, session: this.session });
      }
      $cache;
      /**
       * Incorporates a previously defined CTE (using `$with`) into the main query.
       *
       * This method allows the main query to reference a temporary named result set.
       *
       * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
       *
       * @param queries The CTEs to incorporate into the main query.
       *
       * @example
       *
       * ```ts
       * // Define a subquery 'sq' as a CTE using $with
       * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
       *
       * // Incorporate the CTE 'sq' into the main query and select from it
       * const result = await db.with(sq).select().from(sq);
       * ```
       */
      with(...queries) {
        const self = this;
        function select2(fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: self.session,
            dialect: self.dialect,
            withList: queries
          });
        }
        function selectDistinct(fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: self.session,
            dialect: self.dialect,
            withList: queries,
            distinct: true
          });
        }
        function selectDistinctOn(on, fields) {
          return new PgSelectBuilder({
            fields: fields ?? void 0,
            session: self.session,
            dialect: self.dialect,
            withList: queries,
            distinct: { on }
          });
        }
        function update(table) {
          return new PgUpdateBuilder(table, self.session, self.dialect, queries);
        }
        function insert(table) {
          return new PgInsertBuilder(table, self.session, self.dialect, queries);
        }
        function delete_(table) {
          return new PgDeleteBase(table, self.session, self.dialect, queries);
        }
        return { select: select2, selectDistinct, selectDistinctOn, update, insert, delete: delete_ };
      }
      select(fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: this.session,
          dialect: this.dialect
        });
      }
      selectDistinct(fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: this.session,
          dialect: this.dialect,
          distinct: true
        });
      }
      selectDistinctOn(on, fields) {
        return new PgSelectBuilder({
          fields: fields ?? void 0,
          session: this.session,
          dialect: this.dialect,
          distinct: { on }
        });
      }
      /**
       * Creates an update query.
       *
       * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
       *
       * Use `.set()` method to specify which values to update.
       *
       * See docs: {@link https://orm.drizzle.team/docs/update}
       *
       * @param table The table to update.
       *
       * @example
       *
       * ```ts
       * // Update all rows in the 'cars' table
       * await db.update(cars).set({ color: 'red' });
       *
       * // Update rows with filters and conditions
       * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
       *
       * // Update with returning clause
       * const updatedCar: Car[] = await db.update(cars)
       *   .set({ color: 'red' })
       *   .where(eq(cars.id, 1))
       *   .returning();
       * ```
       */
      update(table) {
        return new PgUpdateBuilder(table, this.session, this.dialect);
      }
      /**
       * Creates an insert query.
       *
       * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
       *
       * See docs: {@link https://orm.drizzle.team/docs/insert}
       *
       * @param table The table to insert into.
       *
       * @example
       *
       * ```ts
       * // Insert one row
       * await db.insert(cars).values({ brand: 'BMW' });
       *
       * // Insert multiple rows
       * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
       *
       * // Insert with returning clause
       * const insertedCar: Car[] = await db.insert(cars)
       *   .values({ brand: 'BMW' })
       *   .returning();
       * ```
       */
      insert(table) {
        return new PgInsertBuilder(table, this.session, this.dialect);
      }
      /**
       * Creates a delete query.
       *
       * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
       *
       * See docs: {@link https://orm.drizzle.team/docs/delete}
       *
       * @param table The table to delete from.
       *
       * @example
       *
       * ```ts
       * // Delete all rows in the 'cars' table
       * await db.delete(cars);
       *
       * // Delete rows with filters and conditions
       * await db.delete(cars).where(eq(cars.color, 'green'));
       *
       * // Delete with returning clause
       * const deletedCar: Car[] = await db.delete(cars)
       *   .where(eq(cars.id, 1))
       *   .returning();
       * ```
       */
      delete(table) {
        return new PgDeleteBase(table, this.session, this.dialect);
      }
      refreshMaterializedView(view) {
        return new PgRefreshMaterializedView(view, this.session, this.dialect);
      }
      authToken;
      execute(query) {
        const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
        const builtQuery = this.dialect.sqlToQuery(sequel);
        const prepared = this.session.prepareQuery(
          builtQuery,
          void 0,
          void 0,
          false
        );
        return new PgRaw(
          () => prepared.execute(void 0, this.authToken),
          sequel,
          builtQuery,
          (result) => prepared.mapResult(result, true)
        );
      }
      transaction(transaction, config) {
        return this.session.transaction(transaction, config);
      }
    };
  }
});

// node_modules/drizzle-orm/cache/core/cache.js
async function hashQuery(sql2, params) {
  const dataToHash = `${sql2}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b2) => b2.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
var Cache, NoopCache;
var init_cache = __esm({
  "node_modules/drizzle-orm/cache/core/cache.js"() {
    init_entity();
    Cache = class {
      static [entityKind] = "Cache";
    };
    NoopCache = class extends Cache {
      strategy() {
        return "all";
      }
      static [entityKind] = "NoopCache";
      async get(_key) {
        return void 0;
      }
      async put(_hashedQuery, _response, _tables, _config) {
      }
      async onMutate(_params) {
      }
    };
  }
});

// node_modules/drizzle-orm/cache/core/index.js
var init_core = __esm({
  "node_modules/drizzle-orm/cache/core/index.js"() {
    init_cache();
  }
});

// node_modules/drizzle-orm/pg-core/alias.js
var init_alias2 = __esm({
  "node_modules/drizzle-orm/pg-core/alias.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/roles.js
var PgRole;
var init_roles = __esm({
  "node_modules/drizzle-orm/pg-core/roles.js"() {
    init_entity();
    PgRole = class {
      constructor(name, config) {
        this.name = name;
        if (config) {
          this.createDb = config.createDb;
          this.createRole = config.createRole;
          this.inherit = config.inherit;
        }
      }
      static [entityKind] = "PgRole";
      /** @internal */
      _existing;
      /** @internal */
      createDb;
      /** @internal */
      createRole;
      /** @internal */
      inherit;
      existing() {
        this._existing = true;
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/sequence.js
function pgSequenceWithSchema(name, options, schema) {
  return new PgSequence(name, options, schema);
}
var PgSequence;
var init_sequence = __esm({
  "node_modules/drizzle-orm/pg-core/sequence.js"() {
    init_entity();
    PgSequence = class {
      constructor(seqName, seqOptions, schema) {
        this.seqName = seqName;
        this.seqOptions = seqOptions;
        this.schema = schema;
      }
      static [entityKind] = "PgSequence";
    };
  }
});

// node_modules/drizzle-orm/pg-core/schema.js
var PgSchema;
var init_schema = __esm({
  "node_modules/drizzle-orm/pg-core/schema.js"() {
    init_entity();
    init_sql();
    init_enum();
    init_sequence();
    init_table2();
    init_view();
    PgSchema = class {
      constructor(schemaName) {
        this.schemaName = schemaName;
      }
      static [entityKind] = "PgSchema";
      table = (name, columns, extraConfig) => {
        return pgTableWithSchema(name, columns, extraConfig, this.schemaName);
      };
      view = (name, columns) => {
        return pgViewWithSchema(name, columns, this.schemaName);
      };
      materializedView = (name, columns) => {
        return pgMaterializedViewWithSchema(name, columns, this.schemaName);
      };
      enum(enumName, input) {
        return Array.isArray(input) ? pgEnumWithSchema(
          enumName,
          [...input],
          this.schemaName
        ) : pgEnumObjectWithSchema(enumName, input, this.schemaName);
      }
      sequence = (name, options) => {
        return pgSequenceWithSchema(name, options, this.schemaName);
      };
      getSQL() {
        return new SQL([sql.identifier(this.schemaName)]);
      }
      shouldOmitSQLParens() {
        return true;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/session.js
var PgPreparedQuery, PgSession, PgTransaction;
var init_session = __esm({
  "node_modules/drizzle-orm/pg-core/session.js"() {
    init_cache();
    init_entity();
    init_errors2();
    init_sql2();
    init_tracing();
    init_db();
    PgPreparedQuery = class {
      constructor(query, cache2, queryMetadata, cacheConfig) {
        this.query = query;
        this.cache = cache2;
        this.queryMetadata = queryMetadata;
        this.cacheConfig = cacheConfig;
        if (cache2 && cache2.strategy() === "all" && cacheConfig === void 0) {
          this.cacheConfig = { enable: true, autoInvalidate: true };
        }
        if (!this.cacheConfig?.enable) {
          this.cacheConfig = void 0;
        }
      }
      authToken;
      getQuery() {
        return this.query;
      }
      mapResult(response, _isFromBatch) {
        return response;
      }
      /** @internal */
      setToken(token) {
        this.authToken = token;
        return this;
      }
      static [entityKind] = "PgPreparedQuery";
      /** @internal */
      joinsNotNullableMap;
      /** @internal */
      async queryWithCache(queryString, params, query) {
        if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) {
          try {
            return await query();
          } catch (e) {
            throw new DrizzleQueryError(queryString, params, e);
          }
        }
        if (this.cacheConfig && !this.cacheConfig.enable) {
          try {
            return await query();
          } catch (e) {
            throw new DrizzleQueryError(queryString, params, e);
          }
        }
        if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
          try {
            const [res] = await Promise.all([
              query(),
              this.cache.onMutate({ tables: this.queryMetadata.tables })
            ]);
            return res;
          } catch (e) {
            throw new DrizzleQueryError(queryString, params, e);
          }
        }
        if (!this.cacheConfig) {
          try {
            return await query();
          } catch (e) {
            throw new DrizzleQueryError(queryString, params, e);
          }
        }
        if (this.queryMetadata.type === "select") {
          const fromCache = await this.cache.get(
            this.cacheConfig.tag ?? await hashQuery(queryString, params),
            this.queryMetadata.tables,
            this.cacheConfig.tag !== void 0,
            this.cacheConfig.autoInvalidate
          );
          if (fromCache === void 0) {
            let result;
            try {
              result = await query();
            } catch (e) {
              throw new DrizzleQueryError(queryString, params, e);
            }
            await this.cache.put(
              this.cacheConfig.tag ?? await hashQuery(queryString, params),
              result,
              // make sure we send tables that were used in a query only if user wants to invalidate it on each write
              this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
              this.cacheConfig.tag !== void 0,
              this.cacheConfig.config
            );
            return result;
          }
          return fromCache;
        }
        try {
          return await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
      }
    };
    PgSession = class {
      constructor(dialect) {
        this.dialect = dialect;
      }
      static [entityKind] = "PgSession";
      /** @internal */
      execute(query, token) {
        return tracer.startActiveSpan("drizzle.operation", () => {
          const prepared = tracer.startActiveSpan("drizzle.prepareQuery", () => {
            return this.prepareQuery(
              this.dialect.sqlToQuery(query),
              void 0,
              void 0,
              false
            );
          });
          return prepared.setToken(token).execute(void 0, token);
        });
      }
      all(query) {
        return this.prepareQuery(
          this.dialect.sqlToQuery(query),
          void 0,
          void 0,
          false
        ).all();
      }
      /** @internal */
      async count(sql2, token) {
        const res = await this.execute(sql2, token);
        return Number(
          res[0]["count"]
        );
      }
    };
    PgTransaction = class extends PgDatabase {
      constructor(dialect, session, schema, nestedIndex = 0) {
        super(dialect, session, schema);
        this.schema = schema;
        this.nestedIndex = nestedIndex;
      }
      static [entityKind] = "PgTransaction";
      rollback() {
        throw new TransactionRollbackError();
      }
      /** @internal */
      getTransactionConfigSQL(config) {
        const chunks = [];
        if (config.isolationLevel) {
          chunks.push(`isolation level ${config.isolationLevel}`);
        }
        if (config.accessMode) {
          chunks.push(config.accessMode);
        }
        if (typeof config.deferrable === "boolean") {
          chunks.push(config.deferrable ? "deferrable" : "not deferrable");
        }
        return sql.raw(chunks.join(" "));
      }
      setTransaction(config) {
        return this.session.execute(sql`set transaction ${this.getTransactionConfigSQL(config)}`);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/subquery.js
var init_subquery2 = __esm({
  "node_modules/drizzle-orm/pg-core/subquery.js"() {
  }
});

// node_modules/drizzle-orm/pg-core/utils/index.js
var init_utils4 = __esm({
  "node_modules/drizzle-orm/pg-core/utils/index.js"() {
    init_array();
  }
});

// node_modules/drizzle-orm/pg-core/index.js
var init_pg_core = __esm({
  "node_modules/drizzle-orm/pg-core/index.js"() {
    init_alias2();
    init_checks();
    init_columns();
    init_db();
    init_dialect();
    init_foreign_keys();
    init_indexes();
    init_policies();
    init_primary_keys();
    init_query_builders();
    init_roles();
    init_schema();
    init_sequence();
    init_session();
    init_subquery2();
    init_table2();
    init_unique_constraint();
    init_utils3();
    init_utils4();
    init_view_common2();
    init_view();
  }
});

// node_modules/drizzle-orm/postgres-js/session.js
var PostgresJsPreparedQuery, PostgresJsSession, PostgresJsTransaction;
var init_session2 = __esm({
  "node_modules/drizzle-orm/postgres-js/session.js"() {
    init_core();
    init_entity();
    init_logger();
    init_pg_core();
    init_session();
    init_sql();
    init_tracing();
    init_utils();
    PostgresJsPreparedQuery = class extends PgPreparedQuery {
      constructor(client2, queryString, params, logger, cache2, queryMetadata, cacheConfig, fields, _isResponseInArrayMode, customResultMapper) {
        super({ sql: queryString, params }, cache2, queryMetadata, cacheConfig);
        this.client = client2;
        this.queryString = queryString;
        this.params = params;
        this.logger = logger;
        this.fields = fields;
        this._isResponseInArrayMode = _isResponseInArrayMode;
        this.customResultMapper = customResultMapper;
      }
      static [entityKind] = "PostgresJsPreparedQuery";
      async execute(placeholderValues = {}) {
        return tracer.startActiveSpan("drizzle.execute", async (span) => {
          const params = fillPlaceholders(this.params, placeholderValues);
          span?.setAttributes({
            "drizzle.query.text": this.queryString,
            "drizzle.query.params": JSON.stringify(params)
          });
          this.logger.logQuery(this.queryString, params);
          const { fields, queryString: query, client: client2, joinsNotNullableMap, customResultMapper } = this;
          if (!fields && !customResultMapper) {
            return tracer.startActiveSpan("drizzle.driver.execute", () => {
              return this.queryWithCache(query, params, async () => {
                return await client2.unsafe(query, params);
              });
            });
          }
          const rows = await tracer.startActiveSpan("drizzle.driver.execute", () => {
            span?.setAttributes({
              "drizzle.query.text": query,
              "drizzle.query.params": JSON.stringify(params)
            });
            return this.queryWithCache(query, params, async () => {
              return await client2.unsafe(query, params).values();
            });
          });
          return tracer.startActiveSpan("drizzle.mapResponse", () => {
            return customResultMapper ? customResultMapper(rows) : rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
          });
        });
      }
      all(placeholderValues = {}) {
        return tracer.startActiveSpan("drizzle.execute", async (span) => {
          const params = fillPlaceholders(this.params, placeholderValues);
          span?.setAttributes({
            "drizzle.query.text": this.queryString,
            "drizzle.query.params": JSON.stringify(params)
          });
          this.logger.logQuery(this.queryString, params);
          return tracer.startActiveSpan("drizzle.driver.execute", () => {
            span?.setAttributes({
              "drizzle.query.text": this.queryString,
              "drizzle.query.params": JSON.stringify(params)
            });
            return this.queryWithCache(this.queryString, params, async () => {
              return this.client.unsafe(this.queryString, params);
            });
          });
        });
      }
      /** @internal */
      isResponseInArrayMode() {
        return this._isResponseInArrayMode;
      }
    };
    PostgresJsSession = class _PostgresJsSession extends PgSession {
      constructor(client2, dialect, schema, options = {}) {
        super(dialect);
        this.client = client2;
        this.schema = schema;
        this.options = options;
        this.logger = options.logger ?? new NoopLogger();
        this.cache = options.cache ?? new NoopCache();
      }
      static [entityKind] = "PostgresJsSession";
      logger;
      cache;
      prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
        return new PostgresJsPreparedQuery(
          this.client,
          query.sql,
          query.params,
          this.logger,
          this.cache,
          queryMetadata,
          cacheConfig,
          fields,
          isResponseInArrayMode,
          customResultMapper
        );
      }
      query(query, params) {
        this.logger.logQuery(query, params);
        return this.client.unsafe(query, params).values();
      }
      queryObjects(query, params) {
        return this.client.unsafe(query, params);
      }
      transaction(transaction, config) {
        return this.client.begin(async (client2) => {
          const session = new _PostgresJsSession(
            client2,
            this.dialect,
            this.schema,
            this.options
          );
          const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
          if (config) {
            await tx.setTransaction(config);
          }
          return transaction(tx);
        });
      }
    };
    PostgresJsTransaction = class _PostgresJsTransaction extends PgTransaction {
      constructor(dialect, session, schema, nestedIndex = 0) {
        super(dialect, session, schema, nestedIndex);
        this.session = session;
      }
      static [entityKind] = "PostgresJsTransaction";
      transaction(transaction) {
        return this.session.client.savepoint((client2) => {
          const session = new PostgresJsSession(
            client2,
            this.dialect,
            this.schema,
            this.session.options
          );
          const tx = new _PostgresJsTransaction(this.dialect, session, this.schema);
          return transaction(tx);
        });
      }
    };
  }
});

// node_modules/drizzle-orm/postgres-js/driver.js
function construct(client2, config = {}) {
  const transparentParser = (val) => val;
  for (const type of ["1184", "1082", "1083", "1114", "1182", "1185", "1115", "1231"]) {
    client2.options.parsers[type] = transparentParser;
    client2.options.serializers[type] = transparentParser;
  }
  client2.options.serializers["114"] = transparentParser;
  client2.options.serializers["3802"] = transparentParser;
  const dialect = new PgDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const session = new PostgresJsSession(client2, dialect, schema, { logger, cache: config.cache });
  const db2 = new PostgresJsDatabase(dialect, session, schema);
  db2.$client = client2;
  db2.$cache = config.cache;
  if (db2.$cache) {
    db2.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db2;
}
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const instance = src_default(params[0]);
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection: connection2, client: client2, ...drizzleConfig } = params[0];
    if (client2) return construct(client2, drizzleConfig);
    if (typeof connection2 === "object" && connection2.url !== void 0) {
      const { url, ...config } = connection2;
      const instance2 = src_default(url, config);
      return construct(instance2, drizzleConfig);
    }
    const instance = src_default(connection2);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
var PostgresJsDatabase;
var init_driver = __esm({
  "node_modules/drizzle-orm/postgres-js/driver.js"() {
    init_src();
    init_entity();
    init_logger();
    init_db();
    init_dialect();
    init_relations();
    init_utils();
    init_session2();
    PostgresJsDatabase = class extends PgDatabase {
      static [entityKind] = "PostgresJsDatabase";
    };
    ((drizzle2) => {
      function mock(config) {
        return construct({
          options: {
            parsers: {},
            serializers: {}
          }
        }, config);
      }
      drizzle2.mock = mock;
    })(drizzle || (drizzle = {}));
  }
});

// node_modules/drizzle-orm/postgres-js/index.js
var init_postgres_js = __esm({
  "node_modules/drizzle-orm/postgres-js/index.js"() {
    init_driver();
    init_session2();
  }
});

// src/server/schemas/Summary.ts
var summary;
var init_Summary = __esm({
  "src/server/schemas/Summary.ts"() {
    init_pg_core();
    summary = pgTable("stock_summary", {
      id: text("id").primaryKey(),
      date: doublePrecision("date").notNull(),
      stockCode: text("stock_code").notNull(),
      stockName: text("stock_name"),
      remarks: text("remarks"),
      previous: doublePrecision("previous"),
      firstTrade: doublePrecision("first_trade"),
      priceOpen: doublePrecision("price_open"),
      priceHigh: doublePrecision("price_high"),
      priceLow: doublePrecision("price_low"),
      priceClose: doublePrecision("price_close"),
      change: doublePrecision("change"),
      volume: doublePrecision("volume"),
      value: doublePrecision("value"),
      frequency: doublePrecision("frequency"),
      individualIndex: doublePrecision("individual_index"),
      weightForIndex: doublePrecision("weight_for_index"),
      offerValue: doublePrecision("offer_value"),
      offerVolume: doublePrecision("offer_volume"),
      bidValue: doublePrecision("bid_value"),
      bidVolume: doublePrecision("bid_volume"),
      listedShares: doublePrecision("listed_shares"),
      tradableShares: doublePrecision("tradable_shares"),
      foreignBuy: doublePrecision("foreign_buy"),
      foreignSell: doublePrecision("foreign_sell")
    });
  }
});

// src/server/schemas/Screener.ts
var screener;
var init_Screener = __esm({
  "src/server/schemas/Screener.ts"() {
    init_pg_core();
    screener = pgTable("stock_screener", {
      code: text("code").primaryKey(),
      name: text("name"),
      industry: text("industry"),
      sector: text("sector"),
      subSector: text("sub_sector"),
      subIndustry: text("sub_industry"),
      subIndustryCode: text("sub_industry_code"),
      indexCode: text("index_code"),
      marketCapital: doublePrecision("market_capital"),
      totalRevenue: doublePrecision("total_revenue"),
      npm: doublePrecision("npm"),
      per: doublePrecision("per"),
      pbv: doublePrecision("pbv"),
      roa: doublePrecision("roa"),
      roe: doublePrecision("roe"),
      der: doublePrecision("der"),
      week4PC: doublePrecision("week4_pc"),
      week13PC: doublePrecision("week13_pc"),
      week26PC: doublePrecision("week26_pc"),
      week52PC: doublePrecision("week52_pc"),
      ytdpc: doublePrecision("ytdpc"),
      mtdpc: doublePrecision("mtdpc"),
      umaDate: text("uma_date"),
      notation: text("notation"),
      status: text("status"),
      corpAction: text("corp_action"),
      corpActionDate: text("corp_action_date")
    });
  }
});

// src/server/schemas/Prediction.ts
var instruments, predictions, predictionOutcomes, aiAnalysisRuns;
var init_Prediction = __esm({
  "src/server/schemas/Prediction.ts"() {
    init_pg_core();
    instruments = pgTable("instruments", {
      id: uuid("id").defaultRandom().primaryKey(),
      symbol: text("symbol").notNull().unique(),
      displayName: text("display_name").notNull(),
      assetClass: text("asset_class").notNull(),
      exchange: text("exchange"),
      currency: text("currency"),
      provider: text("provider"),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
    });
    predictions = pgTable(
      "predictions",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        symbol: text("symbol").notNull(),
        assetClass: text("asset_class").notNull(),
        strategy: text("strategy").notNull(),
        horizonDays: integer("horizon_days").notNull(),
        entryPrice: doublePrecision("entry_price").notNull(),
        targetPrice: doublePrecision("target_price").notNull(),
        stopLoss: doublePrecision("stop_loss").notNull(),
        bullishProbability: doublePrecision("bullish_probability").notNull(),
        confidenceScore: doublePrecision("confidence_score").notNull(),
        ruleScore: doublePrecision("rule_score").notNull(),
        aiScore: doublePrecision("ai_score"),
        aiSummary: text("ai_summary"),
        riskNotes: jsonb("risk_notes").$type().default([]).notNull(),
        status: text("status").default("open").notNull(),
        modelVersion: text("model_version").default("rules-v1").notNull(),
        metadata: jsonb("metadata").$type().default({}).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
      },
      (table) => [
        index("predictions_created_at_idx").on(table.createdAt),
        index("predictions_status_idx").on(table.status)
      ]
    );
    predictionOutcomes = pgTable("prediction_outcomes", {
      id: uuid("id").defaultRandom().primaryKey(),
      predictionId: uuid("prediction_id").notNull().references(() => predictions.id),
      evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).defaultNow().notNull(),
      referencePrice: doublePrecision("reference_price").notNull(),
      returnPercent: doublePrecision("return_percent").notNull(),
      maxFavorableExcursion: doublePrecision("max_favorable_excursion"),
      maxAdverseExcursion: doublePrecision("max_adverse_excursion"),
      hitTarget: text("hit_target").notNull(),
      hitStop: text("hit_stop").notNull()
    });
    aiAnalysisRuns = pgTable(
      "ai_analysis_runs",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        predictionId: uuid("prediction_id").references(() => predictions.id),
        symbol: text("symbol").notNull(),
        assetClass: text("asset_class").notNull(),
        strategy: text("strategy").notNull(),
        provider: text("provider").notNull(),
        model: text("model").notNull(),
        promptVersion: text("prompt_version").notNull(),
        status: text("status").notNull(),
        inputHash: text("input_hash"),
        responseSummary: text("response_summary"),
        errorMessage: text("error_message"),
        metadata: jsonb("metadata").$type().default({}).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
      },
      (table) => [index("ai_analysis_runs_input_hash_idx").on(table.inputHash)]
    );
  }
});

// src/server/schemas/MarketOhlc.ts
var marketOhlc;
var init_MarketOhlc = __esm({
  "src/server/schemas/MarketOhlc.ts"() {
    init_pg_core();
    init_Prediction();
    marketOhlc = pgTable(
      "market_ohlc",
      {
        id: uuid("id").defaultRandom().primaryKey(),
        instrumentId: uuid("instrument_id").notNull().references(() => instruments.id),
        dateInt: doublePrecision("date_int").notNull(),
        priceOpen: doublePrecision("price_open"),
        priceHigh: doublePrecision("price_high"),
        priceLow: doublePrecision("price_low"),
        priceClose: doublePrecision("price_close").notNull(),
        volume: doublePrecision("volume")
      },
      (table) => [
        uniqueIndex("market_ohlc_instrument_date_uq").on(table.instrumentId, table.dateInt),
        index("market_ohlc_instrument_date_idx").on(table.instrumentId, table.dateInt)
      ]
    );
  }
});

// src/server/schemas/index.ts
var schemas_exports = {};
__export(schemas_exports, {
  aiAnalysisRuns: () => aiAnalysisRuns,
  instruments: () => instruments,
  marketOhlc: () => marketOhlc,
  predictionOutcomes: () => predictionOutcomes,
  predictions: () => predictions,
  screener: () => screener,
  summary: () => summary
});
var init_schemas = __esm({
  "src/server/schemas/index.ts"() {
    init_Summary();
    init_Screener();
    init_Prediction();
    init_MarketOhlc();
  }
});

// src/server/Database.ts
var Database_exports = {};
__export(Database_exports, {
  default: () => Database_default,
  initDb: () => initDb
});
function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    max: Number(process.env["DATABASE_POOL_SIZE"] ?? 10),
    prepare: false
  };
}
async function initDb() {
  await db.execute(sql`select 1`);
}
var databaseUrl, client, db, Database_default;
var init_Database = __esm({
  "src/server/Database.ts"() {
    init_drizzle_orm();
    init_postgres_js();
    init_src();
    init_schemas();
    databaseUrl = process.env["DATABASE_URL"];
    if (databaseUrl == null || databaseUrl.trim() === "") {
      throw new Error("DATABASE_URL is required for Supabase Postgres");
    }
    client = src_default(parseDatabaseUrl(databaseUrl));
    db = drizzle(client, { schema: schemas_exports });
    Database_default = db;
  }
});

// src/server/Utils.ts
var dateIntRegex, Utils;
var init_Utils = __esm({
  "src/server/Utils.ts"() {
    dateIntRegex = /^\d{8}$/;
    Utils = class {
      static queryString(raw) {
        return typeof raw === "string" ? raw : void 0;
      }
      static parseNumber(value) {
        if (value === void 0 || value === "") {
          return void 0;
        }
        const parsedNum = Number(value);
        return Number.isFinite(parsedNum) ? parsedNum : void 0;
      }
      static parseBoolean(value) {
        return value === "1" || value === "true";
      }
      static parseWeight(value) {
        if (value === void 0 || value === "") {
          return void 0;
        }
        const parsedNum = Number(value);
        return Number.isFinite(parsedNum) && parsedNum >= 0 ? parsedNum : void 0;
      }
      static parseWeek(raw) {
        if (raw === "1") {
          return 1;
        }
        if (raw === "4") {
          return 4;
        }
        if (raw === "13") {
          return 13;
        }
        return 26;
      }
      static queryParamSent(raw) {
        return typeof raw === "string";
      }
      static isNonEmptyString(value) {
        return value != null && value.trim() !== "";
      }
      static toTitleCase(value) {
        if (value == null || value.trim() === "") {
          return null;
        }
        return value.trim().split(/\s+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
      }
      static changePctFromPrevious(change, previous) {
        const previousValue = previous != null ? Number(previous) : 0;
        const changeValue = change != null ? Number(change) : null;
        if (previousValue <= 0 || changeValue == null || !Number.isFinite(changeValue)) {
          return null;
        }
        return Math.round(changeValue / previousValue * 1e4) / 100;
      }
      static sectorPercentile(sectorRank, sectorCount) {
        if (sectorCount <= 1) {
          return 100;
        }
        return Math.round((sectorCount - sectorRank + 1) / sectorCount * 1e3) / 1e3;
      }
      static compositePercentile(index2, totalCount) {
        if (totalCount <= 1) {
          return 100;
        }
        return Math.round((1 - index2 / totalCount) * 1e3) / 10;
      }
      static round3(n) {
        return Math.round(n * 1e3) / 1e3;
      }
      static returnPctFromPrices(first, last) {
        if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) {
          return null;
        }
        return (last - first) / first * 100;
      }
      static buildCompositeWeights(valueWeight, qualityWeight, momentumWeight) {
        if (valueWeight === void 0 && qualityWeight === void 0 && momentumWeight === void 0) {
          return void 0;
        }
        return {
          ...valueWeight !== void 0 && { valueWeight },
          ...qualityWeight !== void 0 && { qualityWeight },
          ...momentumWeight !== void 0 && { momentumWeight }
        };
      }
      static pushToMapList(map, key, value) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(value);
      }
      static toFundamentalsMap(rows) {
        const fundamentalsMap = /* @__PURE__ */ new Map();
        for (const row of rows) {
          fundamentalsMap.set(row.code, {
            per: row.per != null && Number.isFinite(Number(row.per)) ? Number(row.per) : null,
            roa: row.roa != null && Number.isFinite(Number(row.roa)) ? Number(row.roa) : null,
            roe: row.roe != null && Number.isFinite(Number(row.roe)) ? Number(row.roe) : null,
            der: row.der != null && Number.isFinite(Number(row.der)) ? Number(row.der) : null,
            week1PC: row.week1PC != null && Number.isFinite(Number(row.week1PC)) ? Number(row.week1PC) : null,
            week4PC: row.week4PC != null && Number.isFinite(Number(row.week4PC)) ? Number(row.week4PC) : null,
            week13PC: row.week13PC != null && Number.isFinite(Number(row.week13PC)) ? Number(row.week13PC) : null,
            week26PC: row.week26PC != null && Number.isFinite(Number(row.week26PC)) ? Number(row.week26PC) : null,
            week52PC: row.week52PC != null && Number.isFinite(Number(row.week52PC)) ? Number(row.week52PC) : null,
            pbv: row.pbv != null && Number.isFinite(Number(row.pbv)) ? Number(row.pbv) : null,
            marketCapital: row.marketCapital != null && Number.isFinite(Number(row.marketCapital)) ? Number(row.marketCapital) : null,
            npm: row.npm != null && Number.isFinite(Number(row.npm)) ? Number(row.npm) : null
          });
        }
        return fundamentalsMap;
      }
      static screenerPassesFundamentalFilter(row, filter) {
        if (filter.perMin != null && row.per != null && row.per < filter.perMin) {
          return false;
        }
        if (filter.perMax != null && row.per != null && row.per > filter.perMax) {
          return false;
        }
        if (filter.roeMin != null && row.roe != null && row.roe < filter.roeMin) {
          return false;
        }
        if (filter.derMax != null && row.der != null && row.der > filter.derMax) {
          return false;
        }
        if (filter.pbvMax != null && row.pbv != null && row.pbv > filter.pbvMax) {
          return false;
        }
        if (filter.minMarketCapital != null && row.marketCapital != null && row.marketCapital < filter.minMarketCapital) {
          return false;
        }
        if (filter.netMarginMin != null && row.npm != null && row.npm < filter.netMarginMin) {
          return false;
        }
        let momentumValue = null;
        if (filter.momentumWeek === 1) {
          momentumValue = row.week1PC ?? null;
        } else if (filter.momentumWeek === 4) {
          momentumValue = row.week4PC ?? null;
        } else if (filter.momentumWeek === 13) {
          momentumValue = row.week13PC ?? null;
        } else if (filter.momentumWeek === 26) {
          momentumValue = row.week26PC;
        }
        if (filter.momentumMin != null && momentumValue != null && momentumValue < filter.momentumMin) {
          return false;
        }
        return true;
      }
      static parseDate(value) {
        if (value === void 0 || value === "" || !dateIntRegex.test(value)) {
          return null;
        }
        return parseInt(value, 10);
      }
      static addDaysToDateInt(dateInt, deltaDays) {
        const year = Math.floor(dateInt / 1e4);
        const month = Math.floor(dateInt % 1e4 / 100) - 1;
        const day = dateInt % 100;
        const date2 = new Date(year, month, day);
        date2.setDate(date2.getDate() + deltaDays);
        const resultYear = date2.getFullYear();
        const resultMonth = String(date2.getMonth() + 1).padStart(2, "0");
        const resultDay = String(date2.getDate()).padStart(2, "0");
        return parseInt(`${resultYear}${resultMonth}${resultDay}`, 10);
      }
      static uniqueSorted(values2) {
        const set = /* @__PURE__ */ new Set();
        for (const entry of values2) {
          if (entry != null && entry.trim() !== "") {
            set.add(entry.trim());
          }
        }
        return [...set].sort((first, second) => first.localeCompare(second));
      }
      static parseLimitOffset(limitRaw, offsetRaw, defaultLimit = 500, maxLimit = 1e3) {
        const limitNum = limitRaw !== void 0 && limitRaw !== "" && Number.isFinite(Number(limitRaw)) && Number(limitRaw) >= 0 ? Number(limitRaw) : null;
        const offsetNum = offsetRaw !== void 0 && offsetRaw !== "" && Number.isFinite(Number(offsetRaw)) && Number(offsetRaw) >= 0 ? Number(offsetRaw) : null;
        const limit = Math.min(Math.max(0, limitNum ?? defaultLimit), maxLimit);
        const offset = Math.max(0, offsetNum ?? 0);
        return { limit, offset };
      }
      static applyPagination(items, offset, limit) {
        const totalCount = items.length;
        const paginatedItems = items.slice(offset, offset + limit);
        return { data: paginatedItems, totalCount };
      }
    };
  }
});

// src/server/routes/api/general.ts
async function GET2(ctx) {
  const screenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    industry: screener.industry,
    sector: screener.sector,
    subSector: screener.subSector,
    subIndustry: screener.subIndustry
  }).from(screener);
  const stockList = screenerRows.map((row) => ({
    code: row.code,
    name: row.name ?? ""
  }));
  const industries = Utils.uniqueSorted(screenerRows.map((row) => row.industry));
  const sectors = Utils.uniqueSorted(screenerRows.map((row) => row.sector));
  const subSectors = Utils.uniqueSorted(screenerRows.map((row) => row.subSector));
  const subIndustries = Utils.uniqueSorted(screenerRows.map((row) => row.subIndustry));
  const response = {
    stockList,
    industries,
    sectors,
    subSectors,
    subIndustries
  };
  return ctx.send.json(response);
}
var init_general = __esm({
  "src/server/routes/api/general.ts"() {
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/services/Client.ts
var Client;
var init_Client = __esm({
  "src/server/services/Client.ts"() {
    Client = class _Client {
      static origin = "https://www.idx.co.id";
      static browserHeaders = {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        Referer: `${_Client.origin}/`,
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
      };
      sessionCookie = "";
      async ensureSession() {
        if (this.sessionCookie) {
          return;
        }
        const indexResponse = await fetch(`${_Client.origin}/id`, {
          headers: _Client.browserHeaders
        });
        const setCookieHeaders = indexResponse.headers.getSetCookie?.() ?? [];
        this.sessionCookie = setCookieHeaders.join("; ");
        await this.wait(1e3);
        indexResponse.body?.cancel?.();
        const validationResponse = await fetch(`${_Client.origin}/primary/home/GetIndexList`, {
          headers: {
            ..._Client.browserHeaders,
            ...this.sessionCookie ? { Cookie: this.sessionCookie } : {}
          }
        });
        validationResponse.body?.cancel?.();
      }
      async get(url) {
        await this.ensureSession();
        const headers = {
          ..._Client.browserHeaders,
          ...this.sessionCookie ? { Cookie: this.sessionCookie } : {}
        };
        const response = await fetch(url, { headers });
        if (!response.ok && response.status === 403) {
          this.sessionCookie = "";
        }
        return response;
      }
      wait(delayMs) {
        return new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    };
  }
});

// src/server/services/Composite.ts
var Composite;
var init_Composite = __esm({
  "src/server/services/Composite.ts"() {
    Composite = class _Composite {
      static defaultValueWeight = 0.4;
      static defaultQualityWeight = 0.3;
      static defaultMomentumWeight = 0.3;
      static resolveWeights(weights) {
        if (weights == null) {
          return {
            valueWeight: _Composite.defaultValueWeight,
            qualityWeight: _Composite.defaultQualityWeight,
            momentumWeight: _Composite.defaultMomentumWeight
          };
        }
        const valueWeightNum = Number.isFinite(Number(weights.valueWeight)) ? Number(weights.valueWeight) : _Composite.defaultValueWeight;
        const qualityWeightNum = Number.isFinite(Number(weights.qualityWeight)) ? Number(weights.qualityWeight) : _Composite.defaultQualityWeight;
        const momentumWeightNum = Number.isFinite(Number(weights.momentumWeight)) ? Number(weights.momentumWeight) : _Composite.defaultMomentumWeight;
        const weightSum = valueWeightNum + qualityWeightNum + momentumWeightNum;
        if (weightSum <= 0) {
          return {
            valueWeight: _Composite.defaultValueWeight,
            qualityWeight: _Composite.defaultQualityWeight,
            momentumWeight: _Composite.defaultMomentumWeight
          };
        }
        return {
          valueWeight: valueWeightNum / weightSum,
          qualityWeight: qualityWeightNum / weightSum,
          momentumWeight: momentumWeightNum / weightSum
        };
      }
      static minMaxNormalize(values2) {
        const filtered = values2.filter((value) => Number.isFinite(value));
        if (filtered.length === 0) {
          return /* @__PURE__ */ new Map();
        }
        const min = Math.min(...filtered);
        const max = Math.max(...filtered);
        const span = max - min;
        const valueToNormalizedMap = /* @__PURE__ */ new Map();
        for (const value of values2) {
          if (!Number.isFinite(value)) {
            continue;
          }
          valueToNormalizedMap.set(value, span === 0 ? 0.5 : (value - min) / span);
        }
        return valueToNormalizedMap;
      }
      static averageOf(values2) {
        const finiteValues = values2.filter((value) => Number.isFinite(value));
        if (finiteValues.length === 0) {
          return 0;
        }
        return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
      }
      static computeRanked(rows, weights) {
        if (rows.length === 0) {
          return [];
        }
        const { valueWeight, qualityWeight, momentumWeight } = _Composite.resolveWeights(weights);
        const perNorm = _Composite.minMaxNormalize(rows.map((row) => row.per ?? NaN));
        const pbvNorm = _Composite.minMaxNormalize(rows.map((row) => row.pbv ?? NaN));
        const roeNorm = _Composite.minMaxNormalize(rows.map((row) => row.roe ?? NaN));
        const roaNorm = _Composite.minMaxNormalize(rows.map((row) => row.roa ?? NaN));
        const derNorm = _Composite.minMaxNormalize(rows.map((row) => row.der ?? NaN));
        const week4Norm = _Composite.minMaxNormalize(rows.map((row) => row.week4PC ?? NaN));
        const week13Norm = _Composite.minMaxNormalize(rows.map((row) => row.week13PC ?? NaN));
        const week26Norm = _Composite.minMaxNormalize(rows.map((row) => row.week26PC ?? NaN));
        const week52Norm = _Composite.minMaxNormalize(rows.map((row) => row.week52PC ?? NaN));
        const scoredRows = rows.map((row) => {
          const perScore = row.per != null && row.per > 0 ? 1 - (perNorm.get(row.per) ?? 0) : 0;
          const pbvScore = row.pbv != null && row.pbv > 0 ? 1 - (pbvNorm.get(row.pbv) ?? 0) : 0;
          const valueParts = [perScore, pbvScore].filter(
            (_, i) => [row.per, row.pbv][i] != null && [row.per, row.pbv][i] > 0
          );
          const valueScore = valueParts.length > 0 ? _Composite.averageOf(valueParts) : 0;
          const roeScore = row.roe != null ? roeNorm.get(row.roe) ?? 0 : 0;
          const roaScore = row.roa != null ? roaNorm.get(row.roa) ?? 0 : 0;
          const derScore = row.der != null && row.der >= 0 ? 1 - (derNorm.get(row.der) ?? 0) : 0;
          const qualityParts = [roeScore, roaScore, derScore].filter(
            (_, i) => [row.roe, row.roa, row.der][i] != null
          );
          const qualityScore = qualityParts.length > 0 ? _Composite.averageOf(qualityParts) : 0;
          const week4Score = row.week4PC != null ? week4Norm.get(row.week4PC) ?? 0 : 0;
          const week13Score = row.week13PC != null ? week13Norm.get(row.week13PC) ?? 0 : 0;
          const week26Score = row.week26PC != null ? week26Norm.get(row.week26PC) ?? 0 : 0;
          const week52Score = row.week52PC != null ? week52Norm.get(row.week52PC) ?? 0 : 0;
          const momentumParts = [week4Score, week13Score, week26Score, week52Score].filter(
            (_, i) => [row.week4PC, row.week13PC, row.week26PC, row.week52PC][i] != null
          );
          const momentumScore = momentumParts.length > 0 ? _Composite.averageOf(momentumParts) : 0;
          const compositeScore = valueWeight * valueScore + qualityWeight * qualityScore + momentumWeight * momentumScore;
          const compositeScore100 = Math.round(compositeScore * 1e3) / 10;
          return {
            code: row.code,
            name: row.name,
            sector: row.sector,
            valueScore: Math.round(valueScore * 1e3) / 1e3,
            qualityScore: Math.round(qualityScore * 1e3) / 1e3,
            momentumScore: Math.round(momentumScore * 1e3) / 1e3,
            compositeScore: compositeScore100,
            rank: 0
          };
        });
        scoredRows.sort((a, b2) => b2.compositeScore - a.compositeScore);
        scoredRows.forEach((row, index2) => {
          row.rank = index2 + 1;
        });
        return scoredRows;
      }
    };
  }
});

// src/server/services/Date.ts
var CronDate;
var init_Date = __esm({
  "src/server/services/Date.ts"() {
    CronDate = class _CronDate {
      static stringToDateInt(dateStr) {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) {
          return 0;
        }
        return parseInt(`${match[1]}${match[2]}${match[3]}`, 10);
      }
      static todayDateInt() {
        return _CronDate.getDateIntForDayOffset(0);
      }
      static getDateIntForDayOffset(daysOffset) {
        const targetDate = /* @__PURE__ */ new Date();
        targetDate.setDate(targetDate.getDate() + daysOffset);
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, "0");
        const day = String(targetDate.getDate()).padStart(2, "0");
        return parseInt(`${year}${month}${day}`, 10);
      }
      /**
       * Jakarta calendar date (yyyymmdd) for a timestamp, so evaluation windows
       * line up with the IDX date convention regardless of server timezone.
       */
      static jakartaDateIntFromDate(date2) {
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).formatToParts(date2);
        const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return parseInt(`${byType["year"]}${byType["month"]}${byType["day"]}`, 10);
      }
    };
  }
});

// src/server/services/Fetcher.ts
var init_Fetcher = __esm({
  "src/server/services/Fetcher.ts"() {
    init_services();
  }
});

// src/server/services/prediction/numbers.ts
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function round2(value) {
  return Math.round(value * 100) / 100;
}
var init_numbers = __esm({
  "src/server/services/prediction/numbers.ts"() {
  }
});

// src/server/services/prediction/parseDeepSeek.ts
function toFiniteNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter((entry) => entry !== "").slice(0, 20);
}
function toStringOrNull(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}
function parseLabel(value) {
  if (value === "bullish" || value === "neutral" || value === "bearish") {
    return value;
  }
  return null;
}
function extractJsonObject(raw) {
  const withoutFences = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("no JSON object found");
  }
  return JSON.parse(withoutFences.slice(firstBrace, lastBrace + 1));
}
function parseDeepSeek(rawContent) {
  const empty = {
    label: null,
    bullishProbability: null,
    targetPrice: null,
    stopLoss: null,
    horizonDays: null,
    reasons: [],
    riskWarnings: [],
    confidenceScore: null,
    disclaimer: null
  };
  if (rawContent == null || rawContent.trim() === "") {
    return empty;
  }
  let parsed;
  try {
    parsed = extractJsonObject(rawContent);
  } catch {
    return empty;
  }
  if (parsed == null || typeof parsed !== "object") {
    return empty;
  }
  const record = parsed;
  const probability = toFiniteNumber(record.bullishProbability);
  const confidence = toFiniteNumber(record.confidenceScore);
  const horizon = toFiniteNumber(record.horizonDays);
  return {
    label: parseLabel(record.label),
    bullishProbability: probability != null ? clamp(probability, 0, 100) : null,
    targetPrice: toFiniteNumber(record.targetPrice),
    stopLoss: toFiniteNumber(record.stopLoss),
    horizonDays: horizon != null && Number.isInteger(horizon) && horizon >= 1 && horizon <= 365 ? horizon : null,
    reasons: toStringArray(record.reasons),
    riskWarnings: toStringArray(record.riskWarnings),
    confidenceScore: confidence != null ? clamp(confidence, 0, 100) : null,
    disclaimer: toStringOrNull(record.disclaimer)
  };
}
var init_parseDeepSeek = __esm({
  "src/server/services/prediction/parseDeepSeek.ts"() {
    init_numbers();
  }
});

// src/server/services/DeepSeek.ts
import { createHash } from "node:crypto";
function rateLimitAllows() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}
function buildPayloadHash(input) {
  const canonical = JSON.stringify({
    symbol: input.symbol,
    assetClass: input.assetClass,
    strategy: input.strategy,
    entryPrice: input.entryPrice,
    promptVersion: PROMPT_VERSION,
    closes: input.closes,
    fundamentals: input.fundamentals,
    indicators: input.indicators,
    ruleOutput: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  });
  return createHash("sha256").update(canonical).digest("hex");
}
function truncate(text2, maxLength) {
  return text2.length <= maxLength ? text2 : `${text2.slice(0, maxLength)}...`;
}
function buildDeepSeekPrompt(input) {
  const isStock = input.assetClass === "stock";
  const system = [
    "You are a disciplined trading-analysis assistant for the IDX + Forex AI Screener.",
    isStock ? "The instrument is an Indonesian equity. Use its fundamentals (PER, PBV, ROE, ROA, DER, market cap, revenue, sector, corporate-action flags) together with price technicals." : "The instrument is a forex pair or precious metal. Use price technicals and volatility only; there are no equity fundamentals.",
    `The trader's strategy is "${input.strategy}" (scalping: intraday-to-days, swing: days-to-weeks, long_term: weeks-to-months).`,
    "You are given rule-engine output; critically compare it with your own read. Disagree where the data supports it.",
    "Respond with STRICT JSON only \u2014 no markdown fences, no prose outside the JSON object. Schema:",
    '{"label":"bullish|neutral|bearish","bullishProbability":0-100,"targetPrice":number,"stopLoss":number,"horizonDays":integer,"reasons":["..."],"riskWarnings":["..."],"confidenceScore":0-100,"disclaimer":"..."}',
    "",
    "## Directional Pricing",
    `- If label is "bullish": targetPrice must be ABOVE entry (${input.entryPrice}), stopLoss BELOW entry (long position)`,
    `- If label is "bearish": targetPrice must be BELOW entry (${input.entryPrice}), stopLoss ABOVE entry (short position)`,
    '- If label is "neutral": provide the most likely directional move with corresponding target/stop',
    "",
    "The disclaimer must state that this is analysis support, not guaranteed profit or financial advice."
  ].join("\n");
  const user = JSON.stringify({
    instrument: {
      symbol: input.symbol,
      assetClass: input.assetClass,
      strategy: input.strategy,
      entryPrice: input.entryPrice
    },
    ...input.fundamentals != null ? { fundamentals: input.fundamentals } : {},
    technicals: {
      closes: input.closes.slice(-90),
      rsi14: input.indicators?.rsi14 ?? null,
      ema20: input.indicators?.ema20 ?? null,
      ema50: input.indicators?.ema50 ?? null,
      ema200: input.indicators?.ema200 ?? null,
      atrPct: input.indicators?.atrPct ?? null,
      realizedVolPct: input.indicators?.realizedVolPct ?? null,
      return20Pct: input.indicators?.return20Pct ?? null
    },
    ruleEngine: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      ruleScore: input.ruleOutput.ruleScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  });
  return { system, user };
}
var PROMPT_VERSION, DEEPSEEK_ENDPOINT, CACHE_TTL_MS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, REQUEST_TIMEOUT_MS, COST_PER_1M_INPUT, COST_PER_1M_OUTPUT, requestTimestamps, DeepSeek;
var init_DeepSeek = __esm({
  "src/server/services/DeepSeek.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_parseDeepSeek();
    PROMPT_VERSION = "deepseek-v2-1";
    DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
    CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
    RATE_LIMIT_WINDOW_MS = 6e4;
    RATE_LIMIT_MAX_REQUESTS = 10;
    REQUEST_TIMEOUT_MS = 6e4;
    COST_PER_1M_INPUT = 0.27;
    COST_PER_1M_OUTPUT = 1.1;
    requestTimestamps = [];
    DeepSeek = class _DeepSeek {
      static async analyze(input) {
        const apiKey = process.env["DEEPSEEK_API_KEY"];
        const model = process.env["DEEPSEEK_MODEL"] ?? "deepseek-chat";
        if (apiKey == null || apiKey.trim() === "") {
          return {
            status: "skipped",
            model,
            promptVersion: PROMPT_VERSION,
            summary: null,
            parsed: parseDeepSeek(null),
            runId: null,
            errorMessage: "DEEPSEEK_API_KEY is not configured",
            tokens: null,
            estimatedCostUsd: null
          };
        }
        const inputHash = buildPayloadHash(input);
        const cached = await _DeepSeek.findCachedRun(inputHash);
        if (cached != null && cached.responseSummary != null) {
          const run2 = await _DeepSeek.recordRun(input, {
            status: "cached",
            inputHash,
            responseSummary: cached.responseSummary,
            metadata: { cachedFrom: cached.id }
          });
          return {
            status: "cached",
            model,
            promptVersion: PROMPT_VERSION,
            summary: cached.responseSummary,
            parsed: parseDeepSeek(cached.responseSummary),
            runId: run2?.id ?? null,
            errorMessage: null,
            tokens: null,
            estimatedCostUsd: null
          };
        }
        if (!rateLimitAllows()) {
          const run2 = await _DeepSeek.recordRun(input, {
            status: "failed",
            inputHash,
            errorMessage: "rate limit exceeded"
          });
          return {
            status: "failed",
            model,
            promptVersion: PROMPT_VERSION,
            summary: null,
            parsed: parseDeepSeek(null),
            runId: run2?.id ?? null,
            errorMessage: "Rate limit exceeded. Try again in a minute.",
            tokens: null,
            estimatedCostUsd: null
          };
        }
        const { system, user } = buildDeepSeekPrompt(input);
        let content = null;
        let tokens = null;
        let errorMessage = null;
        try {
          const response = await fetch(DEEPSEEK_ENDPOINT, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user }
              ],
              temperature: 0.2
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
          });
          if (!response.ok) {
            errorMessage = `DeepSeek API ${response.status}`;
          } else {
            const json2 = await response.json();
            content = json2.choices?.[0]?.message?.content?.trim() ?? null;
            tokens = {
              promptTokens: json2.usage?.prompt_tokens ?? 0,
              completionTokens: json2.usage?.completion_tokens ?? 0
            };
          }
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : String(error);
        }
        const status = content != null ? "success" : "failed";
        const estimatedCostUsd = tokens != null ? tokens.promptTokens / 1e6 * COST_PER_1M_INPUT + tokens.completionTokens / 1e6 * COST_PER_1M_OUTPUT : null;
        const run = await _DeepSeek.recordRun(input, {
          status,
          inputHash,
          responseSummary: content != null ? truncate(content, 8e3) : null,
          errorMessage,
          metadata: { tokens, estimatedCostUsd }
        });
        return {
          status,
          model,
          promptVersion: PROMPT_VERSION,
          summary: content,
          parsed: parseDeepSeek(content),
          runId: run?.id ?? null,
          errorMessage,
          tokens,
          estimatedCostUsd
        };
      }
      static async findCachedRun(inputHash) {
        const rows = await Database_default.select().from(aiAnalysisRuns).where(
          and(
            eq(aiAnalysisRuns.inputHash, inputHash),
            eq(aiAnalysisRuns.status, "success")
          )
        ).orderBy(desc(aiAnalysisRuns.createdAt)).limit(1);
        const run = rows[0];
        if (run == null || run.responseSummary == null) {
          return null;
        }
        const createdAtMs = new Date(run.createdAt).getTime();
        if (Date.now() - createdAtMs > CACHE_TTL_MS) {
          return null;
        }
        return run;
      }
      static async recordRun(input, run) {
        const inserted = await Database_default.insert(aiAnalysisRuns).values({
          predictionId: input.predictionId ?? null,
          symbol: input.symbol,
          assetClass: input.assetClass,
          strategy: input.strategy,
          provider: "deepseek",
          model: process.env["DEEPSEEK_MODEL"] ?? "deepseek-chat",
          promptVersion: PROMPT_VERSION,
          status: run.status,
          inputHash: run.inputHash,
          responseSummary: run.responseSummary ?? null,
          errorMessage: run.errorMessage ?? null,
          metadata: run.metadata ?? {}
        }).returning();
        return inserted[0] ?? null;
      }
      static async recentRuns(filters) {
        const conditions = [];
        if (filters.symbol != null && filters.symbol !== "") {
          conditions.push(eq(aiAnalysisRuns.symbol, filters.symbol));
        }
        if (filters.assetClass != null && filters.assetClass !== "") {
          conditions.push(eq(aiAnalysisRuns.assetClass, filters.assetClass));
        }
        const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
        return await Database_default.select().from(aiAnalysisRuns).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(aiAnalysisRuns.createdAt)).limit(limit);
      }
    };
  }
});

// src/server/services/OpenCode.ts
import { createHash as createHash2 } from "node:crypto";
function rateLimitAllows2() {
  const now = Date.now();
  while (requestTimestamps2.length > 0 && now - requestTimestamps2[0] > RATE_LIMIT_WINDOW_MS2) {
    requestTimestamps2.shift();
  }
  if (requestTimestamps2.length >= RATE_LIMIT_MAX_REQUESTS2) {
    return false;
  }
  requestTimestamps2.push(now);
  return true;
}
function buildPayloadHash2(input) {
  const canonical = JSON.stringify({
    symbol: input.symbol,
    assetClass: input.assetClass,
    strategy: input.strategy,
    entryPrice: input.entryPrice,
    promptVersion: PROMPT_VERSION2,
    closes: input.closes,
    fundamentals: input.fundamentals,
    indicators: input.indicators,
    ruleOutput: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  });
  return createHash2("sha256").update(canonical).digest("hex");
}
function truncate2(text2, maxLength) {
  return text2.length <= maxLength ? text2 : `${text2.slice(0, maxLength)}...`;
}
function buildOpenCodePrompt(input) {
  const isStock = input.assetClass === "stock";
  const isIntraday = input.strategy === "scalping_hourly" || input.strategy === "scalping_minutes";
  const system = [
    "You are a disciplined trading-analysis assistant for the IDX + Forex AI Screener.",
    "",
    "## Scope Rules (trading-analysis skill)",
    "You MUST stay within professional stock and forex analysis scope.",
    "You are NOT permitted to:",
    "- Generate code, scripts, or programming solutions",
    "- Discuss topics unrelated to financial markets",
    "- Provide general knowledge or trivia",
    "- Act as a general-purpose chatbot",
    "",
    "You ARE permitted to:",
    "- Analyze technical indicators (RSI, MACD, Moving Averages, Bollinger Bands, ATR)",
    "- Evaluate fundamental metrics (PER, PBV, ROE, ROA, DER, market cap)",
    "- Assess market conditions and volatility",
    "- Provide entry/exit recommendations with risk management",
    "- Identify support/resistance levels",
    "- Discuss sector rotation and market sentiment",
    "",
    "## Analysis Framework",
    isStock ? "The instrument is an Indonesian equity. Use its fundamentals (PER, PBV, ROE, ROA, DER, market cap, revenue, sector, corporate-action flags) together with price technicals." : "The instrument is a forex pair or precious metal. Use price technicals and volatility only; there are no equity fundamentals.",
    `The trader's strategy is "${input.strategy}" (scalping: intraday-to-days, swing: days-to-weeks, long_term: weeks-to-months).`,
    isIntraday ? "For intraday strategies, focus on short-term momentum, mean-reversion signals, and quick scalp opportunities. Tighter stops and targets are expected." : "",
    "You are given rule-engine output; critically compare it with your own read. Disagree where the data supports it.",
    "",
    "## Output Contract",
    "Respond with STRICT JSON only \u2014 no markdown fences, no prose outside the JSON object. Schema:",
    '{"label":"bullish|neutral|bearish","bullishProbability":0-100,"targetPrice":number,"stopLoss":number,"horizonDays":integer,"reasons":["..."],"riskWarnings":["..."],"confidenceScore":0-100,"disclaimer":"..."}',
    "",
    "## Directional Pricing",
    '- If label is "bullish": targetPrice must be ABOVE entry, stopLoss BELOW entry (long position)',
    '- If label is "bearish": targetPrice must be BELOW entry, stopLoss ABOVE entry (short position)',
    '- If label is "neutral": provide the most likely directional move with corresponding target/stop',
    `- The rule engine's current entry price is ${input.entryPrice}.`,
    "",
    "## Risk Management Rules",
    "- Stop loss MUST be defined for every recommendation",
    "- Risk-reward ratio should be at least 1:2 for swing trades, 1:1.5 for scalps",
    "- Never recommend risking more than 2% of portfolio on a single position",
    "- Consider position sizing based on account risk tolerance",
    "",
    "## Disclaimer Requirement",
    "The disclaimer must state that this is analysis support, not guaranteed profit or financial advice.",
    "Always remind the user that past performance does not guarantee future results."
  ].filter((line2) => line2 !== "").join("\n");
  const user = JSON.stringify({
    instrument: {
      symbol: input.symbol,
      assetClass: input.assetClass,
      strategy: input.strategy,
      entryPrice: input.entryPrice
    },
    ...input.fundamentals != null ? { fundamentals: input.fundamentals } : {},
    technicals: {
      closes: input.closes.slice(-90),
      rsi14: input.indicators?.rsi14 ?? null,
      ema20: input.indicators?.ema20 ?? null,
      ema50: input.indicators?.ema50 ?? null,
      ema200: input.indicators?.ema200 ?? null,
      atrPct: input.indicators?.atrPct ?? null,
      realizedVolPct: input.indicators?.realizedVolPct ?? null,
      return20Pct: input.indicators?.return20Pct ?? null
    },
    ruleEngine: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      ruleScore: input.ruleOutput.ruleScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  });
  return { system, user };
}
var PROMPT_VERSION2, DEFAULT_ENDPOINT, CACHE_TTL_MS2, RATE_LIMIT_WINDOW_MS2, RATE_LIMIT_MAX_REQUESTS2, REQUEST_TIMEOUT_MS2, COST_PER_1M_INPUT2, COST_PER_1M_OUTPUT2, requestTimestamps2, OpenCode;
var init_OpenCode = __esm({
  "src/server/services/OpenCode.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_parseDeepSeek();
    PROMPT_VERSION2 = "openrouter-v1-0";
    DEFAULT_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    CACHE_TTL_MS2 = 24 * 60 * 60 * 1e3;
    RATE_LIMIT_WINDOW_MS2 = 6e4;
    RATE_LIMIT_MAX_REQUESTS2 = 10;
    REQUEST_TIMEOUT_MS2 = 6e4;
    COST_PER_1M_INPUT2 = 0;
    COST_PER_1M_OUTPUT2 = 0;
    requestTimestamps2 = [];
    OpenCode = class _OpenCode {
      static async analyze(input) {
        const apiKey = process.env["OPENROUTER_API_KEY"] ?? process.env["OPENCODE_API_KEY"];
        const model = process.env["OPENCODE_MODEL"] ?? "nvidia/nemotron-3.5-lightning:free";
        const endpoint = process.env["OPENCODE_API_ENDPOINT"] ?? DEFAULT_ENDPOINT;
        if (apiKey == null || apiKey.trim() === "") {
          return {
            status: "skipped",
            model,
            promptVersion: PROMPT_VERSION2,
            summary: null,
            parsed: parseDeepSeek(null),
            runId: null,
            errorMessage: "OPENROUTER_API_KEY is not configured",
            tokens: null,
            estimatedCostUsd: null
          };
        }
        const inputHash = buildPayloadHash2(input);
        const cached = await _OpenCode.findCachedRun(inputHash);
        if (cached != null && cached.responseSummary != null) {
          const run2 = await _OpenCode.recordRun(input, {
            status: "cached",
            inputHash,
            responseSummary: cached.responseSummary,
            metadata: { cachedFrom: cached.id }
          });
          return {
            status: "cached",
            model,
            promptVersion: PROMPT_VERSION2,
            summary: cached.responseSummary,
            parsed: parseDeepSeek(cached.responseSummary),
            runId: run2?.id ?? null,
            errorMessage: null,
            tokens: null,
            estimatedCostUsd: null
          };
        }
        if (!rateLimitAllows2()) {
          const run2 = await _OpenCode.recordRun(input, {
            status: "failed",
            inputHash,
            errorMessage: "rate limit exceeded"
          });
          return {
            status: "failed",
            model,
            promptVersion: PROMPT_VERSION2,
            summary: null,
            parsed: parseDeepSeek(null),
            runId: run2?.id ?? null,
            errorMessage: "Rate limit exceeded. Try again in a minute.",
            tokens: null,
            estimatedCostUsd: null
          };
        }
        const { system, user } = buildOpenCodePrompt(input);
        let content = null;
        let tokens = null;
        let errorMessage = null;
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://idx-screener.neabyte.com",
              "X-Title": "IDX Screener"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user }
              ],
              temperature: 0.2
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS2)
          });
          if (!response.ok) {
            errorMessage = `OpenCode API ${response.status}`;
          } else {
            const json2 = await response.json();
            content = json2.choices?.[0]?.message?.content?.trim() ?? null;
            tokens = {
              promptTokens: json2.usage?.prompt_tokens ?? 0,
              completionTokens: json2.usage?.completion_tokens ?? 0
            };
          }
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : String(error);
        }
        const status = content != null ? "success" : "failed";
        const estimatedCostUsd = tokens != null ? tokens.promptTokens / 1e6 * COST_PER_1M_INPUT2 + tokens.completionTokens / 1e6 * COST_PER_1M_OUTPUT2 : null;
        const run = await _OpenCode.recordRun(input, {
          status,
          inputHash,
          responseSummary: content != null ? truncate2(content, 8e3) : null,
          errorMessage,
          metadata: { tokens, estimatedCostUsd }
        });
        return {
          status,
          model,
          promptVersion: PROMPT_VERSION2,
          summary: content,
          parsed: parseDeepSeek(content),
          runId: run?.id ?? null,
          errorMessage,
          tokens,
          estimatedCostUsd
        };
      }
      static async findCachedRun(inputHash) {
        const rows = await Database_default.select().from(aiAnalysisRuns).where(
          and(
            eq(aiAnalysisRuns.inputHash, inputHash),
            eq(aiAnalysisRuns.status, "success"),
            eq(aiAnalysisRuns.provider, "opencode")
          )
        ).orderBy(desc(aiAnalysisRuns.createdAt)).limit(1);
        const run = rows[0];
        if (run == null || run.responseSummary == null) {
          return null;
        }
        const createdAtMs = new Date(run.createdAt).getTime();
        if (Date.now() - createdAtMs > CACHE_TTL_MS2) {
          return null;
        }
        return run;
      }
      static async recordRun(input, run) {
        const inserted = await Database_default.insert(aiAnalysisRuns).values({
          predictionId: input.predictionId ?? null,
          symbol: input.symbol,
          assetClass: input.assetClass,
          strategy: input.strategy,
          provider: "opencode",
          model: process.env["OPENCODE_MODEL"] ?? "nvidia/nemotron-3.5-lightning:free",
          promptVersion: PROMPT_VERSION2,
          status: run.status,
          inputHash: run.inputHash,
          responseSummary: run.responseSummary ?? null,
          errorMessage: run.errorMessage ?? null,
          metadata: run.metadata ?? {}
        }).returning();
        return inserted[0] ?? null;
      }
      static async recentRuns(filters) {
        const conditions = [eq(aiAnalysisRuns.provider, "opencode")];
        if (filters.symbol != null && filters.symbol !== "") {
          conditions.push(eq(aiAnalysisRuns.symbol, filters.symbol));
        }
        if (filters.assetClass != null && filters.assetClass !== "") {
          conditions.push(eq(aiAnalysisRuns.assetClass, filters.assetClass));
        }
        const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
        return await Database_default.select().from(aiAnalysisRuns).where(and(...conditions)).orderBy(desc(aiAnalysisRuns.createdAt)).limit(limit);
      }
    };
  }
});

// src/server/services/YahooFinance.ts
function toYahooTicker(symbol) {
  return METAL_TICKERS[symbol] ?? `${symbol.replace("/", "")}=X`;
}
function jakartaDateIntFromUnixSeconds(unixSeconds) {
  const date2 = new Date(unixSeconds * 1e3);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date2);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return parseInt(`${byType["year"]}${byType["month"]}${byType["day"]}`, 10);
}
var YAHOO_BASE, REQUEST_TIMEOUT_MS3, METAL_TICKERS, YahooFinance;
var init_YahooFinance = __esm({
  "src/server/services/YahooFinance.ts"() {
    init_Database();
    init_schemas();
    YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
    REQUEST_TIMEOUT_MS3 = 1e4;
    METAL_TICKERS = {
      "XAU/USD": "GC=F",
      "XAG/USD": "SI=F"
    };
    YahooFinance = class {
      static async fetchDailyBars(symbol, range = "1y") {
        const url = `${YAHOO_BASE}/${encodeURIComponent(toYahooTicker(symbol))}?interval=1d&range=${range}&includePrePost=false&events=div%2Csplit`;
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
              Accept: "application/json"
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS3)
          });
          if (!response.ok) {
            return { ok: false, error: `Yahoo HTTP ${response.status}` };
          }
          const json2 = await response.json();
          const result = json2.chart?.result?.[0];
          if (result == null) {
            return { ok: false, error: "empty chart result" };
          }
          const timestamps = result.timestamp ?? [];
          const quote = result.indicators?.quote?.[0];
          const bars = [];
          for (let index2 = 0; index2 < timestamps.length; index2++) {
            const close = quote?.close?.[index2];
            if (close == null || !Number.isFinite(close)) {
              continue;
            }
            bars.push({
              dateInt: jakartaDateIntFromUnixSeconds(timestamps[index2]),
              open: quote?.open?.[index2] ?? null,
              high: quote?.high?.[index2] ?? null,
              low: quote?.low?.[index2] ?? null,
              close,
              volume: quote?.volume?.[index2] ?? null
            });
          }
          return { ok: true, bars };
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      /** Upserts bars keyed on (instrument, date). */
      static async upsertBars(instrumentId, bars) {
        if (bars.length === 0) {
          return;
        }
        await Database_default.transaction(async (tx) => {
          for (const bar of bars) {
            const row = {
              instrumentId,
              dateInt: bar.dateInt,
              priceOpen: bar.open,
              priceHigh: bar.high,
              priceLow: bar.low,
              priceClose: bar.close,
              volume: bar.volume
            };
            await tx.insert(marketOhlc).values(row).onConflictDoUpdate({
              target: [
                marketOhlc.instrumentId,
                marketOhlc.dateInt
              ],
              set: {
                priceOpen: row.priceOpen,
                priceHigh: row.priceHigh,
                priceLow: row.priceLow,
                priceClose: row.priceClose,
                volume: row.volume
              }
            });
          }
        });
      }
    };
  }
});

// src/server/services/InstrumentService.ts
var YAHOO_RANGE, InstrumentService;
var init_InstrumentService = __esm({
  "src/server/services/InstrumentService.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_Date();
    init_YahooFinance();
    YAHOO_RANGE = "1y";
    InstrumentService = class _InstrumentService {
      static async bySymbol(symbol) {
        const rows = await Database_default.select().from(instruments).where(eq(instruments.symbol, symbol)).limit(1);
        return rows[0] ?? null;
      }
      static async isKnown(symbol) {
        return await _InstrumentService.bySymbol(symbol) != null;
      }
      static async list() {
        const instruments2 = await Database_default.select().from(instruments).orderBy(asc(instruments.symbol));
        if (instruments2.length === 0) {
          return [];
        }
        const items = [];
        for (const instrument of instruments2) {
          const bars = await _InstrumentService.latestBars(instrument.symbol, 2);
          const latest = bars[bars.length - 1] ?? null;
          const previous = bars.length > 1 ? bars[bars.length - 2] : null;
          items.push({
            symbol: instrument.symbol,
            displayName: instrument.displayName,
            assetClass: instrument.assetClass,
            currency: instrument.currency,
            exchange: instrument.exchange,
            provider: instrument.provider,
            latestPrice: latest?.close ?? null,
            latestDateInt: latest?.dateInt ?? null,
            dayChangePct: latest != null && previous != null && previous.close > 0 ? (latest.close - previous.close) / previous.close * 100 : null
          });
        }
        return items;
      }
      /**
       * Lazy top-up: fetches fresh Yahoo bars only when the latest stored bar is
       * older than the previous calendar day. Never throws — a failed fetch just
       * leaves cached data in place.
       */
      static async ensureFresh(symbol) {
        const instrument = await _InstrumentService.bySymbol(symbol);
        if (instrument == null) {
          return;
        }
        const latestBars = await _InstrumentService.latestBars(symbol, 1);
        const latestDateInt = latestBars[0]?.dateInt ?? null;
        const staleThreshold = CronDate.getDateIntForDayOffset(-1);
        if (latestDateInt != null && latestDateInt >= staleThreshold) {
          return;
        }
        const fetched = await YahooFinance.fetchDailyBars(symbol, YAHOO_RANGE);
        if (!fetched.ok) {
          console.warn(`[instruments] Yahoo fetch failed for ${symbol}: ${fetched.error}`);
          return;
        }
        await YahooFinance.upsertBars(instrument.id, fetched.bars);
      }
      /** Recent bars for a symbol, ascending by date. */
      static async latestBars(symbol, limit) {
        const instrument = await _InstrumentService.bySymbol(symbol);
        if (instrument == null) {
          return [];
        }
        const rows = await Database_default.select().from(marketOhlc).where(eq(marketOhlc.instrumentId, instrument.id)).orderBy(desc(marketOhlc.dateInt)).limit(limit);
        return rows.map((row) => ({
          dateInt: row.dateInt,
          open: row.priceOpen,
          high: row.priceHigh,
          low: row.priceLow,
          close: row.priceClose,
          volume: row.volume
        })).sort((first, second) => first.dateInt - second.dateInt);
      }
      /** Bars within an inclusive date range, ascending — used by outcome evaluation. */
      static async barsBetween(symbol, fromDateInt, toDateInt) {
        const instrument = await _InstrumentService.bySymbol(symbol);
        if (instrument == null) {
          return [];
        }
        const rows = await Database_default.select().from(marketOhlc).where(
          and(
            eq(marketOhlc.instrumentId, instrument.id),
            gte(marketOhlc.dateInt, fromDateInt),
            lte(marketOhlc.dateInt, toDateInt)
          )
        );
        return rows.map((row) => ({
          dateInt: row.dateInt,
          open: row.priceOpen,
          high: row.priceHigh,
          low: row.priceLow,
          close: row.priceClose,
          volume: row.volume
        })).sort((first, second) => first.dateInt - second.dateInt);
      }
    };
  }
});

// src/server/services/ZpiTradingViewClient.ts
var ZPI_TV_BASE_URL, REQUEST_TIMEOUT_MS4, ZpiTradingViewClient;
var init_ZpiTradingViewClient = __esm({
  "src/server/services/ZpiTradingViewClient.ts"() {
    ZPI_TV_BASE_URL = "https://api.zpi.web.id/v1/finance:tradingview";
    REQUEST_TIMEOUT_MS4 = 15e3;
    ZpiTradingViewClient = class {
      apiKey;
      fetchImpl;
      constructor(options = {}) {
        const apiKey = options.apiKey ?? process.env["ZPI_API_KEY"];
        this.apiKey = apiKey != null && apiKey.trim() !== "" ? apiKey.trim() : void 0;
        this.fetchImpl = options.fetchImpl ?? fetch;
      }
      isConfigured() {
        return this.apiKey != null;
      }
      // ─── URL builders ───────────────────────────────────────────────────────
      buildUrl(endpoint, params) {
        const url = new URL(`${ZPI_TV_BASE_URL}/${endpoint}`);
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (value !== void 0 && value !== null) {
              url.searchParams.set(key, String(value));
            }
          }
        }
        return url.toString();
      }
      screenerUrl(params) {
        return this.buildUrl("screener", {
          market: params?.market,
          search: params?.search,
          columns: params?.columns,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          page: params?.page,
          count: params?.count
        });
      }
      symbolUrl(params) {
        return this.buildUrl("symbol", {
          symbol: params.symbol,
          market: params.market
        });
      }
      marketsUrl(params) {
        return this.buildUrl("markets", {
          search: params?.search,
          scope: params?.scope
        });
      }
      chartUrl(params) {
        return this.buildUrl("chart", {
          symbol: params.symbol,
          market: params.market,
          resolution: params.resolution,
          count: params.count
        });
      }
      technicalsUrl(params) {
        return this.buildUrl("technicals", {
          symbol: params.symbol,
          market: params.market,
          timeframe: params.timeframe,
          columns: params.columns
        });
      }
      performanceUrl(params) {
        return this.buildUrl("performance", {
          symbol: params.symbol,
          market: params.market
        });
      }
      financialsUrl(params) {
        return this.buildUrl("financials", {
          symbol: params.symbol,
          market: params.market,
          period: params.period
        });
      }
      newsUrl(params) {
        return this.buildUrl("news", {
          symbol: params.symbol,
          market: params.market,
          lang: params.lang,
          count: params.count
        });
      }
      searchUrl(params) {
        return this.buildUrl("search", {
          q: params.q,
          exchange: params.exchange,
          type: params.type,
          page: params.page,
          count: params.count
        });
      }
      calendarUrl(params) {
        return this.buildUrl("calendar", {
          countries: params?.countries,
          from: params?.from,
          to: params?.to,
          importance: params?.importance
        });
      }
      quoteUrl(params) {
        return this.buildUrl("quote", {
          symbol: params.symbol,
          market: params.market,
          scope: params.scope
        });
      }
      // ─── Fetch helpers ──────────────────────────────────────────────────────
      async requestInit() {
        if (this.apiKey == null) {
          throw new Error("ZPI_API_KEY is not configured");
        }
        return {
          headers: {
            Accept: "application/json",
            "x-api-key": this.apiKey
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS4)
        };
      }
      async request(url) {
        const init = await this.requestInit();
        const response = await this.fetchImpl(url, init);
        if (!response.ok) {
          throw new Error(`ZPI TradingView API ${response.status}: ${response.statusText}`);
        }
        const raw = await response.json();
        const inner = raw["data"];
        return inner ?? raw;
      }
      // ─── Data fetchers ──────────────────────────────────────────────────────
      async fetchScreener(params) {
        return this.request(this.screenerUrl(params));
      }
      async fetchSymbol(params) {
        return this.request(this.symbolUrl(params));
      }
      async fetchMarkets(params) {
        return this.request(this.marketsUrl(params));
      }
      async fetchChart(params) {
        return this.request(this.chartUrl(params));
      }
      async fetchTechnicals(params) {
        return this.request(this.technicalsUrl(params));
      }
      async fetchPerformance(params) {
        return this.request(this.performanceUrl(params));
      }
      async fetchFinancials(params) {
        return this.request(this.financialsUrl(params));
      }
      async fetchNews(params) {
        return this.request(this.newsUrl(params));
      }
      async fetchSearch(params) {
        return this.request(this.searchUrl(params));
      }
      async fetchCalendar(params) {
        return this.request(this.calendarUrl(params));
      }
      async fetchQuote(params) {
        return this.request(this.quoteUrl(params));
      }
    };
  }
});

// src/server/RSI.ts
var RSI;
var init_RSI = __esm({
  "src/server/RSI.ts"() {
    RSI = class _RSI {
      static defaultPeriod = 14;
      static calculate(closes, period = _RSI.defaultPeriod) {
        if (closes.length === 0 || period < 1) {
          return [];
        }
        const result = new Array(closes.length).fill(null);
        if (closes.length < period + 1) {
          return result;
        }
        let sumGain = 0;
        let sumLoss = 0;
        for (let i = 1; i <= period; i++) {
          const change = closes[i] - closes[i - 1];
          if (change > 0) {
            sumGain += change;
          } else if (change < 0) {
            sumLoss += -change;
          }
        }
        let avgGain = sumGain / period;
        let avgLoss = sumLoss / period;
        result[period] = _RSI.fromAverages(avgGain, avgLoss);
        for (let i = period + 1; i < closes.length; i++) {
          const change = closes[i] - closes[i - 1];
          const gain = change > 0 ? change : 0;
          const loss = change < 0 ? -change : 0;
          avgGain = (avgGain * (period - 1) + gain) / period;
          avgLoss = (avgLoss * (period - 1) + loss) / period;
          result[i] = _RSI.fromAverages(avgGain, avgLoss);
        }
        return result;
      }
      static fromAverages(avgGain, avgLoss) {
        if (avgLoss === 0) {
          return 100;
        }
        const rs = avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
      }
    };
  }
});

// src/server/services/prediction/indicators.ts
function average(values2) {
  const finiteValues = values2.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return null;
  }
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}
function ema(values2, period) {
  if (values2.length < period || period < 1) {
    return null;
  }
  const multiplier = 2 / (period + 1);
  const seed = average(values2.slice(0, period));
  if (seed == null) {
    return null;
  }
  let current = seed;
  for (const value of values2.slice(period)) {
    current = (value - current) * multiplier + current;
  }
  return current;
}
function rsi14(closes) {
  const values2 = RSI.calculate(closes, RSI.defaultPeriod);
  return values2[values2.length - 1] ?? null;
}
function trueRangeAt(highs, lows, closes, index2) {
  if (index2 < 1 || index2 >= closes.length) {
    return null;
  }
  const high = highs[index2];
  const low = lows[index2];
  const closePrev = closes[index2 - 1];
  if (high == null || low == null || closePrev == null || !Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(closePrev)) {
    return null;
  }
  return Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev));
}
function atr14(highs, lows, closes, period = 14) {
  const length = Math.min(highs.length, lows.length, closes.length);
  if (length < period + 1) {
    return null;
  }
  const trValues = [];
  for (let index2 = 1; index2 < length; index2++) {
    const tr = trueRangeAt(highs, lows, closes, index2);
    if (tr == null) {
      continue;
    }
    trValues.push(tr);
  }
  if (trValues.length < period) {
    return null;
  }
  let atr = trValues.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of trValues.slice(period)) {
    atr = (atr * (period - 1) + value) / period;
  }
  return atr;
}
function realizedVol20(closes) {
  const window = closes.slice(-21);
  const returns = [];
  for (let index2 = 1; index2 < window.length; index2++) {
    const previous = window[index2 - 1];
    const current = window[index2];
    if (previous == null || current == null || !Number.isFinite(previous) || !Number.isFinite(current) || previous <= 0 || current <= 0) {
      continue;
    }
    returns.push(Math.log(current / previous));
  }
  if (returns.length < 2) {
    return null;
  }
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}
function returnOverBars(closes, bars) {
  if (closes.length < bars + 1 || bars < 1) {
    return null;
  }
  const start = closes[closes.length - 1 - bars];
  const end = closes[closes.length - 1];
  if (start == null || end == null || !Number.isFinite(start) || !Number.isFinite(end) || start <= 0) {
    return null;
  }
  return (end - start) / start * 100;
}
var init_indicators = __esm({
  "src/server/services/prediction/indicators.ts"() {
    init_RSI();
  }
});

// src/server/services/prediction/rules.ts
function horizonFor(strategy) {
  return HORIZON_BY_STRATEGY[strategy];
}
function stockDeltas(strategy, fundamentals, indicators, riskNotes) {
  const deltas = [];
  if (fundamentals != null) {
    if ((fundamentals.roe ?? 0) >= 15) {
      deltas.push(12);
    } else {
      riskNotes.push("ROE below preferred threshold");
    }
    if ((fundamentals.der ?? 99) <= 0.8) {
      deltas.push(8);
    } else {
      riskNotes.push("DER above preferred threshold");
    }
    if ((fundamentals.per ?? 999) >= 3 && (fundamentals.per ?? 999) <= 18) {
      deltas.push(8);
    } else {
      riskNotes.push("PER outside value range");
    }
    const momentum = strategy === "long_term" ? fundamentals.week26PC : fundamentals.week13PC;
    if ((momentum ?? 0) > 0) {
      deltas.push(10);
    } else {
      riskNotes.push("Momentum is not supportive");
    }
  }
  if (indicators != null) {
    if (indicators.price != null && indicators.ema20 != null && indicators.price > indicators.ema20) {
      deltas.push(6);
    }
    if (indicators.ema20 != null && indicators.ema50 != null && indicators.ema20 > indicators.ema50) {
      deltas.push(4);
    }
    if (indicators.rsi14 != null && indicators.rsi14 >= 40 && indicators.rsi14 <= 70) {
      deltas.push(3);
    }
    if (indicators.rsi14 != null && indicators.rsi14 > 78) {
      deltas.push(-5);
      riskNotes.push("RSI overbought");
    }
    if (strategy === "long_term" && indicators.price != null && indicators.ema200 != null && indicators.price < indicators.ema200) {
      deltas.push(-8);
      riskNotes.push("Price below EMA200 (structural downtrend)");
    }
  }
  if (fundamentals == null && indicators == null) {
    riskNotes.push("Insufficient data for technical scoring");
  }
  return deltas;
}
function forexDeltas(indicators, strategy, riskNotes) {
  const deltas = [];
  const isIntraday = strategy === "scalping_hourly" || strategy === "scalping_minutes";
  if (indicators != null && indicators.ema20 != null && indicators.ema50 != null) {
    if (indicators.ema20 > indicators.ema50) {
      deltas.push(isIntraday ? 12 : 10);
    } else if (indicators.ema20 < indicators.ema50) {
      deltas.push(isIntraday ? -12 : -10);
      riskNotes.push("EMA20 below EMA50 (short-term downtrend)");
    }
  }
  if (indicators?.rsi14 != null) {
    if (isIntraday) {
      if (indicators.rsi14 >= 45 && indicators.rsi14 <= 60) {
        deltas.push(6);
      } else if (indicators.rsi14 > 70) {
        deltas.push(-6);
        riskNotes.push("RSI overbought (intraday)");
      } else if (indicators.rsi14 < 35) {
        deltas.push(-4);
        riskNotes.push("RSI oversold (intraday)");
      }
    } else {
      if (indicators.rsi14 >= 40 && indicators.rsi14 <= 65) {
        deltas.push(4);
      } else if (indicators.rsi14 > 75) {
        deltas.push(-4);
        riskNotes.push("RSI overbought");
      }
    }
  }
  if (indicators?.return20Pct != null) {
    if (indicators.return20Pct > 0) {
      deltas.push(isIntraday ? 8 : 6);
    } else if (indicators.return20Pct < 0) {
      deltas.push(isIntraday ? -8 : -6);
      riskNotes.push("20-bar return negative");
    }
  }
  if (isIntraday && indicators?.atrPct != null && indicators.atrPct < 0.1) {
    riskNotes.push("Very low volatility \u2014 intraday scalping may underperform");
    deltas.push(-3);
  }
  if (indicators == null || indicators.ema20 == null || indicators.ema50 == null || indicators.rsi14 == null) {
    riskNotes.push("Insufficient price history for technical scoring");
  }
  return deltas;
}
function computeRulePrediction(input) {
  const { symbol, assetClass, strategy, entryPrice } = input;
  const riskNotes = [];
  const deltas = assetClass === "stock" ? stockDeltas(strategy, input.fundamentals, input.indicators, riskNotes) : forexDeltas(input.indicators, strategy, riskNotes);
  const score = clamp(50 + deltas.reduce((sum, value) => sum + value, 0), 5, 95);
  const bullishProbability = round2(score);
  const isBearish = score < 50;
  if (isBearish) {
    riskNotes.push("Bearish bias \u2014 target is below entry (short-side)");
  }
  const atrPct = input.indicators?.atrPct ?? null;
  let targetMovePct = BASE_MOVE[strategy];
  let stopMovePct = BASE_STOP[strategy];
  if (atrPct != null && Number.isFinite(atrPct) && atrPct > 0) {
    targetMovePct = Math.max(targetMovePct, atrPct * ATR_MULT[strategy]);
    stopMovePct = Math.max(stopMovePct, atrPct * STOP_MULT[strategy]);
    riskNotes.push(`ATR-based sizing (ATR ~${round2(atrPct)}% of price)`);
  } else {
    riskNotes.push("Default sizing - volatility data unavailable");
  }
  if (stopMovePct > targetMovePct) {
    stopMovePct = targetMovePct;
  }
  const targetPrice = isBearish ? round2(entryPrice * (1 - targetMovePct / 100)) : round2(entryPrice * (1 + targetMovePct / 100));
  const stopLoss = isBearish ? round2(entryPrice * (1 + stopMovePct / 100)) : round2(entryPrice * (1 - stopMovePct / 100));
  let confidenceScore = 45;
  const isIntraday = strategy === "scalping_hourly" || strategy === "scalping_minutes";
  if (assetClass === "stock") {
    confidenceScore = input.fundamentals != null && input.indicators != null && input.indicators.barCount >= 60 ? 68 : 45;
  } else if (isIntraday) {
    confidenceScore = input.indicators != null && input.indicators.barCount >= 20 ? 52 : 38;
  } else if (input.indicators != null && input.indicators.barCount >= 60) {
    confidenceScore = 55;
  } else {
    confidenceScore = 40;
  }
  return {
    horizonDays: horizonFor(strategy),
    entryPrice,
    targetPrice,
    stopLoss,
    bullishProbability,
    confidenceScore,
    ruleScore: bullishProbability,
    riskNotes,
    metadata: {
      ruleVersion: "rules-v2",
      symbol,
      assetClass,
      strategy,
      direction: isBearish ? "short" : "long",
      ...isIntraday ? { horizonMinutes: INTRADAY_TIMEFRAME[strategy]?.horizonMinutes ?? 60 } : {},
      inputs: {
        rsi14: input.indicators?.rsi14 ?? null,
        ema20: input.indicators?.ema20 ?? null,
        ema50: input.indicators?.ema50 ?? null,
        ema200: input.indicators?.ema200 ?? null,
        atrPct: input.indicators?.atrPct ?? null,
        realizedVolPct: input.indicators?.realizedVolPct ?? null,
        return20Pct: input.indicators?.return20Pct ?? null,
        barCount: input.indicators?.barCount ?? 0
      }
    }
  };
}
var INTRADAY_TIMEFRAME, HORIZON_BY_STRATEGY, BASE_MOVE, BASE_STOP, ATR_MULT, STOP_MULT;
var init_rules = __esm({
  "src/server/services/prediction/rules.ts"() {
    init_numbers();
    INTRADAY_TIMEFRAME = {
      scalping_hourly: { horizonMinutes: 60, resolution: "60", barCount: 6 },
      scalping_minutes: { horizonMinutes: 15, resolution: "15", barCount: 32 }
    };
    HORIZON_BY_STRATEGY = {
      scalping: 1,
      scalping_hourly: 1,
      scalping_minutes: 1,
      swing: 14,
      long_term: 90
    };
    BASE_MOVE = {
      scalping: 1.2,
      scalping_hourly: 0.6,
      scalping_minutes: 0.3,
      swing: 4.5,
      long_term: 12
    };
    BASE_STOP = {
      scalping: 0.6,
      scalping_hourly: 0.3,
      scalping_minutes: 0.15,
      swing: 2.2,
      long_term: 5.5
    };
    ATR_MULT = {
      scalping: 0.6,
      scalping_hourly: 0.3,
      scalping_minutes: 0.2,
      swing: 2,
      long_term: 7
    };
    STOP_MULT = {
      scalping: 0.5,
      scalping_hourly: 0.25,
      scalping_minutes: 0.12,
      swing: 1,
      long_term: 2.5
    };
  }
});

// src/server/services/prediction/inputs.ts
async function latestStockSnapshot(symbol) {
  const latestSummary = await Database_default.select({
    priceClose: summary.priceClose
  }).from(summary).where(eq(summary.stockCode, symbol)).orderBy(desc(summary.date)).limit(1);
  const screenerRows = await Database_default.select({
    roe: screener.roe,
    der: screener.der,
    per: screener.per,
    week13PC: screener.week13PC,
    week26PC: screener.week26PC
  }).from(screener).where(eq(screener.code, symbol)).limit(1);
  const screener2 = screenerRows[0];
  const fundamentals = screener2 == null ? null : {
    roe: screener2.roe,
    der: screener2.der,
    per: screener2.per,
    week13PC: screener2.week13PC,
    week26PC: screener2.week26PC
  };
  return {
    entryPrice: latestSummary[0]?.priceClose ?? null,
    fundamentals
  };
}
function indicatorsFromBars(bars, entryPrice) {
  const closes = bars.map((bar) => bar.close);
  if (closes.length < 3 || entryPrice <= 0) {
    return null;
  }
  const highs = bars.map((bar) => bar.high);
  const lows = bars.map((bar) => bar.low);
  const atr = atr14(highs, lows, closes);
  return {
    price: closes[closes.length - 1],
    rsi14: rsi14(closes),
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    ema200: ema(closes, 200),
    atrPct: atr != null ? atr / entryPrice * 100 : null,
    realizedVolPct: realizedVol20(closes),
    return20Pct: returnOverBars(closes, 20),
    barCount: closes.length
  };
}
async function stockBars(symbol) {
  const rows = await Database_default.select({
    date: summary.date,
    priceHigh: summary.priceHigh,
    priceLow: summary.priceLow,
    priceClose: summary.priceClose
  }).from(summary).where(eq(summary.stockCode, symbol)).orderBy(desc(summary.date)).limit(HISTORY_BARS);
  return rows.reverse().map((row) => ({
    high: row.priceHigh,
    low: row.priceLow,
    close: row.priceClose
  })).filter(
    (bar) => bar.close != null && Number.isFinite(bar.close)
  );
}
async function intradayBarsFromTradingView(symbol, strategy) {
  const tf = INTRADAY_TIMEFRAME[strategy];
  if (tf == null) {
    return [];
  }
  const tv = new ZpiTradingViewClient();
  if (!tv.isConfigured()) {
    return [];
  }
  const tvSymbol = symbol.replace("/", "");
  try {
    const chart = await tv.fetchChart({
      symbol: tvSymbol,
      market: "forex",
      resolution: tf.resolution,
      count: tf.barCount
    });
    return (chart.candles ?? []).map((candle) => ({
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
  } catch (error) {
    console.warn(`[inputs] TradingView intraday fetch failed for ${symbol}:`, error);
    return [];
  }
}
async function assembleRuleInput(symbol, assetClass, strategy, currentPrice) {
  const isIntraday = strategy === "scalping_hourly" || strategy === "scalping_minutes";
  if (assetClass === "stock") {
    if (isIntraday) {
      throw ApiError.badRequest(
        "INVALID_STRATEGY",
        `strategy "${strategy}" is only supported for forex and metal instruments`
      );
    }
    const snapshot = await latestStockSnapshot(symbol);
    const entryPrice2 = currentPrice ?? snapshot.entryPrice;
    if (entryPrice2 == null || !Number.isFinite(entryPrice2) || entryPrice2 <= 0) {
      throw ApiError.conflict(
        "PRICE_UNAVAILABLE",
        "currentPrice is required when no stored latest price is available"
      );
    }
    const bars2 = await stockBars(symbol);
    const indicators2 = bars2.length >= 3 ? indicatorsFromBars(bars2, entryPrice2) : null;
    return {
      ruleInput: {
        symbol,
        assetClass,
        strategy,
        entryPrice: entryPrice2,
        fundamentals: snapshot.fundamentals,
        indicators: indicators2
      },
      closes: bars2.map((bar) => bar.close).slice(-90)
    };
  }
  if (isIntraday) {
    const bars2 = await intradayBarsFromTradingView(symbol, strategy);
    if (bars2.length === 0) {
      throw ApiError.conflict(
        "INTRADAY_DATA_UNAVAILABLE",
        `No intraday data available for ${symbol}. Ensure TradingView API is configured.`
      );
    }
    const latestClose2 = bars2[bars2.length - 1].close;
    const entryPrice2 = currentPrice ?? latestClose2;
    if (entryPrice2 == null || !Number.isFinite(entryPrice2) || entryPrice2 <= 0) {
      throw ApiError.conflict(
        "PRICE_UNAVAILABLE",
        `No current price for ${symbol}. Supply a current price.`
      );
    }
    const indicators2 = bars2.length >= 3 ? indicatorsFromBars(bars2, entryPrice2) : null;
    return {
      ruleInput: {
        symbol,
        assetClass,
        strategy,
        entryPrice: entryPrice2,
        fundamentals: null,
        indicators: indicators2
      },
      closes: bars2.map((bar) => bar.close)
    };
  }
  await InstrumentService.ensureFresh(symbol);
  const bars = await InstrumentService.latestBars(symbol, HISTORY_BARS);
  const latestClose = bars.length > 0 ? bars[bars.length - 1].close : null;
  const entryPrice = currentPrice ?? latestClose;
  if (entryPrice == null || !Number.isFinite(entryPrice) || entryPrice <= 0) {
    throw ApiError.conflict(
      "PRICE_UNAVAILABLE",
      `No stored price for ${symbol} and currentPrice was not provided. Run the ingestion job or supply a current price.`
    );
  }
  const indicators = bars.length >= 3 ? indicatorsFromBars(bars, entryPrice) : null;
  return {
    ruleInput: {
      symbol,
      assetClass,
      strategy,
      entryPrice,
      fundamentals: null,
      indicators
    },
    closes: bars.map((bar) => bar.close).slice(-90)
  };
}
var HISTORY_BARS;
var init_inputs = __esm({
  "src/server/services/prediction/inputs.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_errors();
    init_InstrumentService();
    init_ZpiTradingViewClient();
    init_indicators();
    init_rules();
    HISTORY_BARS = 240;
  }
});

// src/server/services/Prediction.ts
function normalizeSymbol(symbol) {
  return symbol.trim().toUpperCase().replace(/\s+/g, "");
}
function parseStrategy(raw) {
  if (raw === void 0 || raw === "") {
    return "swing";
  }
  if (raw === "scalping" || raw === "scalping_hourly" || raw === "scalping_minutes" || raw === "swing" || raw === "long_term") {
    return raw;
  }
  throw ApiError.badRequest(
    "INVALID_PARAM_STRATEGY",
    `strategy must be one of: scalping, scalping_hourly, scalping_minutes, swing, long_term (got "${raw}")`
  );
}
function parseAssetClass(raw, symbol) {
  if (raw === void 0 || raw === "") {
    if (symbol.startsWith("XAU") || symbol.startsWith("XAG")) {
      return "metal";
    }
    if (symbol.includes("/")) {
      return "forex";
    }
    return "stock";
  }
  if (raw === "stock" || raw === "forex" || raw === "metal") {
    return raw;
  }
  throw ApiError.badRequest(
    "INVALID_PARAM_ASSET_CLASS",
    `assetClass must be one of: stock, forex, metal (got "${raw}")`
  );
}
var SUPPORTED_FOREX_METALS, Prediction;
var init_Prediction2 = __esm({
  "src/server/services/Prediction.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_errors();
    init_DeepSeek();
    init_OpenCode();
    init_InstrumentService();
    init_inputs();
    init_rules();
    SUPPORTED_FOREX_METALS = [
      "XAU/USD",
      "XAG/USD",
      "AUD/USD",
      "EUR/USD",
      "GBP/USD",
      "USD/JPY",
      "USD/CHF",
      "USD/CAD"
    ];
    Prediction = class {
      static async create(input) {
        const symbol = normalizeSymbol(input.symbol);
        if (symbol === "") {
          throw ApiError.badRequest("PREDICTION_INPUT_ERROR", "symbol is required");
        }
        const strategy = parseStrategy(input.strategy);
        const assetClass = parseAssetClass(input.assetClass, symbol);
        if (assetClass !== "stock" && !await InstrumentService.isKnown(symbol)) {
          throw ApiError.badRequest(
            "UNKNOWN_INSTRUMENT",
            `unknown instrument "${symbol}". Supported forex/metals: ${SUPPORTED_FOREX_METALS.join(", ")}`
          );
        }
        const assembled = await assembleRuleInput(symbol, assetClass, strategy, input.currentPrice);
        const ruleOutput = computeRulePrediction(assembled.ruleInput);
        const inserted = await Database_default.insert(predictions).values({
          symbol,
          assetClass,
          strategy,
          horizonDays: ruleOutput.horizonDays,
          entryPrice: ruleOutput.entryPrice,
          targetPrice: ruleOutput.targetPrice,
          stopLoss: ruleOutput.stopLoss,
          bullishProbability: ruleOutput.bullishProbability,
          confidenceScore: ruleOutput.confidenceScore,
          ruleScore: ruleOutput.ruleScore,
          riskNotes: ruleOutput.riskNotes,
          modelVersion: "rules-v2",
          metadata: ruleOutput.metadata
        }).returning();
        let row = inserted[0];
        let aiStatus = "off";
        let aiRun = null;
        const shouldRunAi = input.useDeepSeek === true || input.aiProvider != null;
        const provider = input.aiProvider ?? "deepseek";
        if (shouldRunAi) {
          const analyzeInput = {
            symbol,
            assetClass,
            strategy,
            entryPrice: ruleOutput.entryPrice,
            ruleOutput,
            closes: assembled.closes,
            fundamentals: assembled.ruleInput.fundamentals,
            indicators: assembled.ruleInput.indicators,
            predictionId: row.id
          };
          const result = provider === "opencode" ? await OpenCode.analyze(analyzeInput) : await DeepSeek.analyze(analyzeInput);
          if (result.status === "skipped") {
            aiStatus = "skipped";
          } else if (result.status === "failed") {
            aiStatus = "failed";
          } else {
            aiStatus = "ok";
          }
          aiRun = {
            runId: result.runId,
            status: result.status,
            model: result.model,
            promptVersion: result.promptVersion,
            errorMessage: result.errorMessage,
            tokens: result.tokens,
            estimatedCostUsd: result.estimatedCostUsd
          };
          const updated = await Database_default.update(predictions).set({
            aiScore: result.parsed.bullishProbability,
            aiSummary: result.summary
          }).where(eq(predictions.id, row.id)).returning();
          row = updated[0] ?? row;
        }
        return { ...row, aiStatus, aiRun };
      }
      static async history(limit = 50) {
        return await Database_default.select().from(predictions).orderBy(desc(predictions.createdAt)).limit(Math.min(Math.max(limit, 1), 200));
      }
    };
  }
});

// src/server/services/Screener.ts
var Screener;
var init_Screener2 = __esm({
  "src/server/services/Screener.ts"() {
    init_Database();
    init_schemas();
    init_Utils();
    Screener = class _Screener {
      static screenerUrl = "https://www.idx.co.id/support/stock-screener/api/v1/stock-screener/get";
      static async run(client2) {
        console.info("[screener] fetching from IDX screener API");
        const response = await client2.get(_Screener.screenerUrl);
        if (!response.ok) {
          throw new Error(`Screener API ${response.status}`);
        }
        const apiResponse = await response.json();
        const results = apiResponse.results ?? [];
        if (results.length === 0) {
          console.warn("[screener] IDX API returned 0 results");
          return;
        }
        console.info(`[screener] received ${results.length} stocks from IDX API, upserting`);
        await Database_default.transaction(async (tx) => {
          for (const screenerItem of results) {
            const code = screenerItem.stockCode ?? "";
            if (!code) {
              continue;
            }
            const row = {
              code,
              name: screenerItem.companyName != null ? String(screenerItem.companyName) : null,
              industry: Utils.toTitleCase(
                screenerItem.industry != null ? String(screenerItem.industry) : null
              ),
              sector: Utils.toTitleCase(
                screenerItem.sector != null ? String(screenerItem.sector) : null
              ),
              subSector: Utils.toTitleCase(
                screenerItem.subSector != null ? String(screenerItem.subSector) : null
              ),
              subIndustry: Utils.toTitleCase(
                screenerItem.subIndustry != null ? String(screenerItem.subIndustry) : null
              ),
              subIndustryCode: screenerItem.subIndustryCode != null ? String(screenerItem.subIndustryCode) : null,
              indexCode: screenerItem.indexCode != null ? String(screenerItem.indexCode) : null,
              marketCapital: screenerItem.marketCapital ?? null,
              totalRevenue: screenerItem.tRevenue ?? null,
              npm: screenerItem.npm ?? null,
              per: screenerItem.per ?? null,
              pbv: screenerItem.pbv ?? null,
              roa: screenerItem.roa ?? null,
              roe: screenerItem.roe ?? null,
              der: screenerItem.der ?? null,
              week4PC: screenerItem.week4PC ?? null,
              week13PC: screenerItem.week13PC ?? null,
              week26PC: screenerItem.week26PC ?? null,
              week52PC: screenerItem.week52PC ?? null,
              ytdpc: screenerItem.ytdpc ?? null,
              mtdpc: screenerItem.mtdpc ?? null,
              umaDate: screenerItem.umaDate ?? null,
              notation: screenerItem.notation ?? null,
              status: screenerItem.status ?? null,
              corpAction: screenerItem.corpAction ?? null,
              corpActionDate: screenerItem.corpActionDate ?? null
            };
            await tx.insert(screener).values(row).onConflictDoUpdate({
              target: screener.code,
              set: {
                name: row.name,
                industry: row.industry,
                sector: row.sector,
                subSector: row.subSector,
                subIndustry: row.subIndustry,
                subIndustryCode: row.subIndustryCode,
                indexCode: row.indexCode,
                marketCapital: row.marketCapital,
                totalRevenue: row.totalRevenue,
                npm: row.npm,
                per: row.per,
                pbv: row.pbv,
                roa: row.roa,
                roe: row.roe,
                der: row.der,
                week4PC: row.week4PC,
                week13PC: row.week13PC,
                week26PC: row.week26PC,
                week52PC: row.week52PC,
                ytdpc: row.ytdpc,
                mtdpc: row.mtdpc,
                umaDate: row.umaDate,
                notation: row.notation,
                status: row.status,
                corpAction: row.corpAction,
                corpActionDate: row.corpActionDate
              }
            });
          }
        });
        console.info(`[screener] upserted ${results.length} screener rows`);
      }
    };
  }
});

// src/server/services/ZpiIdxClient.ts
var ZPI_IDX_BASE_URL, REQUEST_TIMEOUT_MS5, ZpiIdxClient;
var init_ZpiIdxClient = __esm({
  "src/server/services/ZpiIdxClient.ts"() {
    ZPI_IDX_BASE_URL = "https://api.zpi.web.id/v1/finance:idx";
    REQUEST_TIMEOUT_MS5 = 15e3;
    ZpiIdxClient = class {
      apiKey;
      fetchImpl;
      constructor(options = {}) {
        const apiKey = options.apiKey ?? process.env["ZPI_API_KEY"];
        this.apiKey = apiKey != null && apiKey.trim() !== "" ? apiKey.trim() : void 0;
        this.fetchImpl = options.fetchImpl ?? fetch;
      }
      isConfigured() {
        return this.apiKey != null;
      }
      // ─── URL builders ───────────────────────────────────────────────────────
      buildUrl(endpoint, params) {
        const url = new URL(`${ZPI_IDX_BASE_URL}/${endpoint}`);
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (value !== void 0 && value !== null) {
              url.searchParams.set(key, String(value));
            }
          }
        }
        return url.toString();
      }
      stockSummaryUrl(dateInt, params) {
        return this.buildUrl("stock-summary", {
          length: params?.length ?? 5e3,
          start: params?.start ?? 0,
          date: dateInt,
          code: params?.code
        });
      }
      indexSummaryUrl(params) {
        return this.buildUrl("index-summary", {
          length: params?.length,
          start: params?.start,
          date: params?.date
        });
      }
      topMoversUrl(params) {
        return this.buildUrl("top-movers", {
          type: params.type,
          resultCount: params.resultCount
        });
      }
      brokerSummaryUrl(params) {
        return this.buildUrl("broker-summary", {
          length: params?.length,
          start: params?.start,
          date: params?.date
        });
      }
      companiesUrl(params) {
        return this.buildUrl("companies", {
          length: params?.length,
          start: params?.start,
          code: params?.code
        });
      }
      securitiesUrl(params) {
        return this.buildUrl("securities", {
          length: params?.length,
          start: params?.start,
          code: params?.code,
          sector: params?.sector,
          board: params?.board
        });
      }
      financialReportUrl(params) {
        return this.buildUrl("financial-report", {
          year: params.year,
          period: params.period,
          code: params.code,
          length: params.length,
          start: params.start
        });
      }
      marketActivityUrl(params) {
        return this.buildUrl("market-activity", { type: params.type });
      }
      newsUrl(params) {
        return this.buildUrl("news", {
          keyword: params?.keyword,
          length: params?.length,
          start: params?.start,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          locale: params?.locale
        });
      }
      sitemapUrl(params) {
        return this.buildUrl("sitemap", {
          locale: params?.locale,
          section: params?.section
        });
      }
      rawUrl(params) {
        return this.buildUrl("raw", { path: params.path, query: params.query });
      }
      announcementsUrl(params) {
        return this.buildUrl("announcements", {
          page: params?.page,
          length: params?.length,
          locale: params?.locale
        });
      }
      companyAnnouncementsUrl(params) {
        return this.buildUrl("company-announcements", {
          code: params.code,
          length: params.length,
          start: params.start,
          locale: params.locale
        });
      }
      foreignFlowUrl(params) {
        return this.buildUrl("foreign-flow", {
          date: params?.date,
          code: params?.code,
          sort: params?.sort,
          length: params?.length,
          start: params?.start
        });
      }
      marginSummaryUrl(params) {
        return this.buildUrl("margin-summary", {
          date: params?.date,
          length: params?.length,
          start: params?.start
        });
      }
      ownershipFilesUrl(params) {
        return this.buildUrl("ownership-files", {
          category: params?.category,
          length: params?.length,
          start: params?.start
        });
      }
      brokersUrl(params) {
        return this.buildUrl("brokers", {
          code: params?.code,
          view: params?.view
        });
      }
      stockHistoryUrl(params) {
        return this.buildUrl("stock-history", {
          code: params.code,
          from: params.from,
          to: params.to,
          length: params.length
        });
      }
      companyProfileUrl(code) {
        return this.buildUrl("company-profile", { code });
      }
      tradingInfoDailyUrl(code) {
        return this.buildUrl("trading-info-daily", { code });
      }
      calendarUrl(params) {
        return this.buildUrl("calendar", {
          date: params?.date,
          range: params?.range
        });
      }
      ipoUrl(params) {
        return this.buildUrl("ipo", {
          year: params?.year,
          length: params?.length,
          start: params?.start
        });
      }
      lendableStockUrl(params) {
        return this.buildUrl("lendable-stock", {
          code: params?.code,
          sort: params?.sort,
          view: params?.view
        });
      }
      umaUrl(params) {
        return this.buildUrl("uma", {
          page: params?.page,
          length: params?.length,
          keyword: params?.keyword,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo
        });
      }
      derivativesUrl(params) {
        return this.buildUrl("derivatives", {
          code: params?.code,
          underlying: params?.underlying,
          sort: params?.sort
        });
      }
      indexConstituentUrl(params) {
        return this.buildUrl("index-constituent", {
          code: params?.code,
          group: params?.group
        });
      }
      suspensionUrl(params) {
        return this.buildUrl("suspension", {
          page: params?.page,
          length: params?.length,
          keyword: params?.keyword,
          type: params?.type,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo
        });
      }
      // ─── Fetch helpers ──────────────────────────────────────────────────────
      async requestInit() {
        if (this.apiKey == null) {
          throw new Error("ZPI_API_KEY is not configured");
        }
        return {
          headers: {
            Accept: "application/json",
            "x-api-key": this.apiKey
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS5)
        };
      }
      async request(url) {
        const init = await this.requestInit();
        const response = await this.fetchImpl(url, init);
        if (!response.ok) {
          throw new Error(`ZPI API ${response.status}: ${response.statusText}`);
        }
        return response.json();
      }
      // ─── Data fetchers ──────────────────────────────────────────────────────
      async fetchStockSummary(dateInt, params) {
        const init = await this.requestInit();
        return this.fetchImpl(this.stockSummaryUrl(dateInt, params), init);
      }
      async fetchIndexSummary(params) {
        return this.request(this.indexSummaryUrl(params));
      }
      async fetchTopMovers(params) {
        return this.request(this.topMoversUrl(params));
      }
      async fetchBrokerSummary(params) {
        return this.request(this.brokerSummaryUrl(params));
      }
      async fetchCompanies(params) {
        return this.request(this.companiesUrl(params));
      }
      async fetchSecurities(params) {
        return this.request(this.securitiesUrl(params));
      }
      async fetchFinancialReport(params) {
        return this.request(this.financialReportUrl(params));
      }
      async fetchMarketActivity(params) {
        return this.request(this.marketActivityUrl(params));
      }
      async fetchNews(params) {
        return this.request(this.newsUrl(params));
      }
      async fetchSitemap(params) {
        return this.request(this.sitemapUrl(params));
      }
      async fetchRaw(params) {
        return this.request(this.rawUrl(params));
      }
      async fetchAnnouncements(params) {
        return this.request(this.announcementsUrl(params));
      }
      async fetchCompanyAnnouncements(params) {
        return this.request(this.companyAnnouncementsUrl(params));
      }
      async fetchForeignFlow(params) {
        return this.request(this.foreignFlowUrl(params));
      }
      async fetchMarginSummary(params) {
        return this.request(this.marginSummaryUrl(params));
      }
      async fetchOwnershipFiles(params) {
        return this.request(this.ownershipFilesUrl(params));
      }
      async fetchBrokers(params) {
        return this.request(this.brokersUrl(params));
      }
      async fetchStockHistory(params) {
        return this.request(this.stockHistoryUrl(params));
      }
      async fetchCompanyProfile(code) {
        return this.request(this.companyProfileUrl(code));
      }
      async fetchTradingInfoDaily(code) {
        return this.request(this.tradingInfoDailyUrl(code));
      }
      async fetchCalendar(params) {
        return this.request(this.calendarUrl(params));
      }
      async fetchIPO(params) {
        return this.request(this.ipoUrl(params));
      }
      async fetchLendableStock(params) {
        return this.request(this.lendableStockUrl(params));
      }
      async fetchUMA(params) {
        return this.request(this.umaUrl(params));
      }
      async fetchDerivatives(params) {
        return this.request(this.derivativesUrl(params));
      }
      async fetchIndexConstituent(params) {
        return this.request(this.indexConstituentUrl(params));
      }
      async fetchSuspension(params) {
        return this.request(this.suspensionUrl(params));
      }
    };
  }
});

// src/server/services/Summary.ts
var Summary;
var init_Summary2 = __esm({
  "src/server/services/Summary.ts"() {
    init_Database();
    init_schemas();
    init_services();
    init_ZpiIdxClient();
    init_ZpiTradingViewClient();
    Summary = class _Summary {
      static stockSummaryUrl = "https://www.idx.co.id/primary/TradingSummary/GetStockSummary";
      static async run(client2, dateInt) {
        const zpiClient = new ZpiIdxClient();
        const usingZpi = zpiClient.isConfigured();
        console.info(`[summary] fetching ${dateInt} via ${usingZpi ? "ZPI" : "IDX fallback"}`);
        const response = usingZpi ? await zpiClient.fetchStockSummary(dateInt) : await client2.get(`${_Summary.stockSummaryUrl}?date=${dateInt}`);
        if (!response.ok) {
          throw new Error(`Stock summary API ${response.status}`);
        }
        const apiResponse = await response.json();
        const raw = apiResponse.data;
        if (!Array.isArray(raw) || raw.length === 0) {
          console.info(`[summary] ZPI returned empty for ${dateInt}, trying TradingView fallback`);
          const tvItems = await _Summary.fetchTradingViewFallback(dateInt);
          if (tvItems.length === 0) {
            console.info(`[summary] no data available for ${dateInt} from any source`);
            return;
          }
          return _Summary.writeItems(tvItems, dateInt);
        }
        const summaryItems = raw;
        const validItems = [];
        let mismatchCount = 0;
        for (const item of summaryItems) {
          const itemDateStr = item.Date ?? "";
          const itemDateInt = itemDateStr ? CronDate.stringToDateInt(itemDateStr) : dateInt;
          if (itemDateInt === dateInt) {
            validItems.push(item);
          } else {
            mismatchCount++;
          }
        }
        if (mismatchCount > 0) {
          console.warn(
            `[summary] ${mismatchCount} items with mismatched dates for ${dateInt} (stale upstream data), skipped`
          );
        }
        if (validItems.length === 0) {
          console.info(`[summary] all ${summaryItems.length} items had mismatched dates for ${dateInt}, nothing to write`);
          return;
        }
        return _Summary.writeItems(validItems, dateInt);
      }
      static async fetchTradingViewFallback(dateInt) {
        const tvClient = new ZpiTradingViewClient();
        if (!tvClient.isConfigured()) {
          console.info(`[summary] ZPI TradingView client not configured, skipping fallback`);
          return [];
        }
        const items = [];
        let page = 1;
        const pageSize = 500;
        let hasMore = true;
        while (hasMore) {
          console.info(`[summary] TradingView screener page ${page}`);
          let result;
          try {
            result = await tvClient.fetchScreener({
              market: "indonesia",
              page,
              count: pageSize
            });
          } catch (err) {
            console.error(`[summary] TradingView screener fetch failed:`, err);
            break;
          }
          if (!result.items || result.items.length === 0) {
            break;
          }
          for (const item of result.items) {
            const previous = item.last - item.change;
            items.push({
              Date: String(dateInt),
              StockCode: item.ticker,
              StockName: item.name,
              Remarks: item.exchange,
              Previous: previous || void 0,
              OpenPrice: void 0,
              FirstTrade: void 0,
              High: void 0,
              Low: void 0,
              Close: item.last,
              Change: item.change,
              Volume: item.volume,
              Value: void 0,
              Frequency: void 0,
              IndexIndividual: void 0,
              WeightForIndex: void 0,
              Offer: void 0,
              OfferVolume: void 0,
              Bid: void 0,
              BidVolume: void 0,
              ListedShares: item.marketCap || void 0,
              TradebleShares: void 0,
              ForeignBuy: void 0,
              ForeignSell: void 0
            });
          }
          hasMore = result.hasMore;
          page++;
        }
        console.info(`[summary] TradingView fallback returned ${items.length} items`);
        return items;
      }
      static async writeItems(items, dateInt) {
        console.info(`[summary] writing ${items.length} items for ${dateInt}`);
        await Database_default.transaction(async (tx) => {
          for (const summaryItem of items) {
            const stockCode = summaryItem.StockCode ?? "";
            if (!stockCode) {
              continue;
            }
            const id = `${dateInt}-${stockCode}`;
            const row = {
              id,
              date: dateInt,
              stockCode,
              stockName: summaryItem.StockName ?? void 0,
              remarks: summaryItem.Remarks ?? void 0,
              previous: summaryItem.Previous ?? void 0,
              firstTrade: summaryItem.FirstTrade ?? void 0,
              priceOpen: summaryItem.OpenPrice ?? void 0,
              priceHigh: summaryItem.High ?? void 0,
              priceLow: summaryItem.Low ?? void 0,
              priceClose: summaryItem.Close ?? void 0,
              change: summaryItem.Change ?? void 0,
              volume: summaryItem.Volume ?? void 0,
              value: summaryItem.Value ?? void 0,
              frequency: summaryItem.Frequency ?? void 0,
              individualIndex: summaryItem.IndexIndividual ?? void 0,
              weightForIndex: summaryItem.WeightForIndex ?? void 0,
              offerValue: summaryItem.Offer ?? void 0,
              offerVolume: summaryItem.OfferVolume ?? void 0,
              bidValue: summaryItem.Bid ?? void 0,
              bidVolume: summaryItem.BidVolume ?? void 0,
              listedShares: summaryItem.ListedShares ?? void 0,
              tradableShares: summaryItem.TradebleShares ?? void 0,
              foreignBuy: summaryItem.ForeignBuy ?? void 0,
              foreignSell: summaryItem.ForeignSell ?? void 0
            };
            await tx.insert(summary).values(row).onConflictDoUpdate({
              target: summary.id,
              set: {
                stockName: row.stockName,
                remarks: row.remarks,
                previous: row.previous,
                firstTrade: row.firstTrade,
                priceOpen: row.priceOpen,
                priceHigh: row.priceHigh,
                priceLow: row.priceLow,
                priceClose: row.priceClose,
                change: row.change,
                volume: row.volume,
                value: row.value,
                frequency: row.frequency,
                individualIndex: row.individualIndex,
                weightForIndex: row.weightForIndex,
                offerValue: row.offerValue,
                offerVolume: row.offerVolume,
                bidValue: row.bidValue,
                bidVolume: row.bidVolume,
                listedShares: row.listedShares,
                tradableShares: row.tradableShares,
                foreignBuy: row.foreignBuy,
                foreignSell: row.foreignSell
              }
            });
          }
        });
      }
    };
  }
});

// src/server/services/Technical.ts
function toFiniteNumber2(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return null;
  }
  return Number(value);
}
function round22(value) {
  return value == null ? null : Math.round(value * 100) / 100;
}
function average2(values2) {
  const finiteValues = values2.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) {
    return null;
  }
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}
function sma(values2, period) {
  if (values2.length < period) {
    return null;
  }
  return average2(values2.slice(-period));
}
function ema2(values2, period) {
  if (values2.length < period) {
    return null;
  }
  const multiplier = 2 / (period + 1);
  const seed = average2(values2.slice(0, period));
  if (seed == null) {
    return null;
  }
  let current = seed;
  for (const value of values2.slice(period)) {
    current = (value - current) * multiplier + current;
  }
  return current;
}
function calculateDmi(rows, period = 14) {
  if (rows.length < period * 2 + 1) {
    return { adx14: null, plusDi14: null, minusDi14: null };
  }
  const trValues = [];
  const plusDmValues = [];
  const minusDmValues = [];
  for (let index2 = 1; index2 < rows.length; index2++) {
    const previous = rows[index2 - 1];
    const current = rows[index2];
    const high = toFiniteNumber2(current.priceHigh);
    const low = toFiniteNumber2(current.priceLow);
    const closePrev = toFiniteNumber2(previous.priceClose);
    const highPrev = toFiniteNumber2(previous.priceHigh);
    const lowPrev = toFiniteNumber2(previous.priceLow);
    if (high == null || low == null || closePrev == null || highPrev == null || lowPrev == null) {
      continue;
    }
    const upMove = high - highPrev;
    const downMove = lowPrev - low;
    plusDmValues.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDmValues.push(downMove > upMove && downMove > 0 ? downMove : 0);
    trValues.push(Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev)));
  }
  if (trValues.length < period * 2) {
    return { adx14: null, plusDi14: null, minusDi14: null };
  }
  let tr = trValues.slice(0, period).reduce((sum, value) => sum + value, 0);
  let plusDm = plusDmValues.slice(0, period).reduce((sum, value) => sum + value, 0);
  let minusDm = minusDmValues.slice(0, period).reduce((sum, value) => sum + value, 0);
  let plusDi = tr > 0 ? 100 * plusDm / tr : 0;
  let minusDi = tr > 0 ? 100 * minusDm / tr : 0;
  const dxValues = [];
  const firstDxBase = plusDi + minusDi;
  dxValues.push(firstDxBase > 0 ? 100 * Math.abs(plusDi - minusDi) / firstDxBase : 0);
  for (let index2 = period; index2 < trValues.length; index2++) {
    tr = tr - tr / period + trValues[index2];
    plusDm = plusDm - plusDm / period + plusDmValues[index2];
    minusDm = minusDm - minusDm / period + minusDmValues[index2];
    plusDi = tr > 0 ? 100 * plusDm / tr : 0;
    minusDi = tr > 0 ? 100 * minusDm / tr : 0;
    const dxBase = plusDi + minusDi;
    dxValues.push(dxBase > 0 ? 100 * Math.abs(plusDi - minusDi) / dxBase : 0);
  }
  if (dxValues.length < period) {
    return { adx14: null, plusDi14: round22(plusDi), minusDi14: round22(minusDi) };
  }
  let adx = dxValues.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of dxValues.slice(period)) {
    adx = (adx * (period - 1) + value) / period;
  }
  return { adx14: round22(adx), plusDi14: round22(plusDi), minusDi14: round22(minusDi) };
}
var Technical;
var init_Technical = __esm({
  "src/server/services/Technical.ts"() {
    init_RSI();
    Technical = class {
      static computeByCode(rows) {
        const rowsByCode = /* @__PURE__ */ new Map();
        for (const row of rows) {
          const list = rowsByCode.get(row.stockCode) ?? [];
          list.push(row);
          rowsByCode.set(row.stockCode, list);
        }
        const result = /* @__PURE__ */ new Map();
        for (const [stockCode, codeRows] of rowsByCode.entries()) {
          const sortedRows = [...codeRows].sort((a, b2) => Number(a.date) - Number(b2.date));
          const closes = sortedRows.map((row) => toFiniteNumber2(row.priceClose)).filter((value) => value != null);
          const volumes = sortedRows.map((row) => toFiniteNumber2(row.volume)).filter((value) => value != null);
          const latest = sortedRows[sortedRows.length - 1];
          const price = toFiniteNumber2(latest?.priceClose);
          const latestVolume = toFiniteNumber2(latest?.volume);
          const previousVolumeAverage = volumes.length > 1 ? average2(volumes.slice(-21, -1)) : null;
          const rsiValues = RSI.calculate(closes, RSI.defaultPeriod);
          const rsi = rsiValues[rsiValues.length - 1] ?? null;
          const close10 = closes.length > 10 ? closes[closes.length - 11] : null;
          const momentum10 = close10 != null && close10 > 0 && price != null ? (price - close10) / close10 * 100 : null;
          result.set(stockCode, {
            price: round22(price),
            rsi14: round22(rsi),
            relVolume: previousVolumeAverage != null && previousVolumeAverage > 0 && latestVolume != null ? round22(latestVolume / previousVolumeAverage) : null,
            ema10: round22(ema2(closes, 10)),
            ema20: round22(ema2(closes, 20)),
            ema50: round22(ema2(closes, 50)),
            ema200: round22(ema2(closes, 200)),
            bbBasis20: round22(sma(closes, 20)),
            momentum10: round22(momentum10),
            ...calculateDmi(sortedRows)
          });
        }
        return result;
      }
    };
  }
});

// src/server/services/News.ts
function xmlDecode(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}
function normalizedTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/gi, " ").trim();
}
function companyTokens(code, name) {
  const rawTokens = `${code} ${name ?? ""}`.toLowerCase().replace(/[^a-z0-9\s]/gi, " ").split(/\s+/).filter(Boolean);
  return [
    ...new Set(rawTokens.filter((token) => token.length >= 3 && !COMPANY_STOP_WORDS.has(token)))
  ];
}
function isRelevant(article, code, name) {
  const text2 = normalizedTitle(`${article.title} ${article.source ?? ""}`);
  const codeLower = code.toLowerCase();
  if (text2.includes(codeLower)) {
    return true;
  }
  const tokens = companyTokens(code, name);
  return tokens.some((token) => text2.includes(token));
}
function recencyWeight(publishedAt) {
  if (publishedAt == null || publishedAt === "") {
    return 1;
  }
  const publishedMs = Date.parse(publishedAt);
  if (!Number.isFinite(publishedMs)) {
    return 1;
  }
  const ageDays = (Date.now() - publishedMs) / 864e5;
  if (ageDays <= 7) {
    return 1.2;
  }
  if (ageDays <= 30) {
    return 1;
  }
  return 0.7;
}
function scoreArticle(article) {
  const text2 = normalizedTitle(article.title);
  let score = 0;
  for (const [phrase, weight] of POSITIVE_PHRASES) {
    if (text2.includes(phrase)) {
      score += weight;
    }
  }
  for (const [phrase, weight] of NEGATIVE_PHRASES) {
    if (text2.includes(phrase)) {
      score -= weight;
    }
  }
  return Math.max(-4, Math.min(4, score)) * recencyWeight(article.publishedAt);
}
var COMPANY_STOP_WORDS, POSITIVE_PHRASES, NEGATIVE_PHRASES, News;
var init_News = __esm({
  "src/server/services/News.ts"() {
    COMPANY_STOP_WORDS = /* @__PURE__ */ new Set([
      "pt",
      "tbk",
      "persero",
      "terbuka",
      "indonesia",
      "bank",
      "sekuritas",
      "perusahaan"
    ]);
    POSITIVE_PHRASES = [
      ["laba bersih naik", 3],
      ["pendapatan naik", 2.5],
      ["revenue growth", 2],
      ["profit growth", 2.5],
      ["bagikan dividen", 2],
      ["dividen jumbo", 2],
      ["kontrak baru", 2],
      ["ekspansi", 1.5],
      ["buyback", 1.5],
      ["upgrade", 1.5],
      ["target harga naik", 1.5],
      ["outperform", 1.5],
      ["akumulasi", 1],
      ["menguat", 1],
      ["rebound", 1]
    ];
    NEGATIVE_PHRASES = [
      ["rugi bersih", 3],
      ["laba turun", 2.5],
      ["pendapatan turun", 2],
      ["gagal bayar", 3],
      ["suspensi", 3],
      ["suspend", 3],
      ["uma", 2],
      ["downgrade", 2],
      ["target harga turun", 1.5],
      ["anjlok", 2],
      ["melemah", 1],
      ["fraud", 3],
      ["korupsi", 3],
      ["pailit", 3],
      ["utang membengkak", 2.5],
      ["rights issue", 1],
      ["dilusi", 1.5]
    ];
    News = class {
      client;
      constructor(client2) {
        this.client = client2;
      }
      async fetchArticlesForQuery(query) {
        const q = encodeURIComponent(`${query} saham OR IDX when:30d`);
        const url = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`;
        const resp = await this.client.get(url);
        if (!resp.ok) {
          return [];
        }
        const text2 = await resp.text();
        const articles = [];
        const seen = /* @__PURE__ */ new Set();
        const itemRe = /<item>([\s\S]*?)<\/item>/gi;
        let mItem;
        while ((mItem = itemRe.exec(text2)) !== null) {
          const item = mItem[1] ?? "";
          const title = xmlDecode(/<title>([\s\S]*?)<\/title>/i.exec(item)?.[1] ?? "");
          const link = xmlDecode(/<link>([\s\S]*?)<\/link>/i.exec(item)?.[1] ?? "");
          const publishedAt = xmlDecode(/<pubDate>([\s\S]*?)<\/pubDate>/i.exec(item)?.[1] ?? "");
          const source = xmlDecode(/<source[^>]*>([\s\S]*?)<\/source>/i.exec(item)?.[1] ?? "");
          const key = normalizedTitle(title);
          if (title === "" || link === "" || seen.has(key)) {
            continue;
          }
          seen.add(key);
          articles.push({
            title,
            link,
            source: source !== "" ? source : null,
            publishedAt: publishedAt !== "" ? publishedAt : null
          });
          if (articles.length >= 20) {
            break;
          }
        }
        return articles;
      }
      async scoreCompany(code, name) {
        const query = name && name.trim() !== "" ? `${code} ${name}` : code;
        try {
          const articles = (await this.fetchArticlesForQuery(query)).filter((article) => isRelevant(article, code, name));
          if (articles.length === 0) {
            return { score: 0, count: 0, label: "neutral", titles: [] };
          }
          const weightedScore = articles.reduce((sum, article) => sum + scoreArticle(article), 0);
          const score = Math.round(
            Math.max(-100, Math.min(100, weightedScore / articles.length * 25))
          );
          const label = score >= 15 ? "positive" : score <= -15 ? "negative" : "neutral";
          return {
            score,
            count: articles.length,
            label,
            titles: articles.map((article) => ({ title: article.title, link: article.link }))
          };
        } catch (e) {
          console.warn(`[news] scoring failed for ${query}:`, String(e));
          return { score: 0, count: 0, label: "neutral", titles: [] };
        }
      }
    };
  }
});

// src/server/services/index.ts
var init_services = __esm({
  "src/server/services/index.ts"() {
    init_Client();
    init_Composite();
    init_Date();
    init_Fetcher();
    init_Prediction2();
    init_Screener2();
    init_Summary2();
    init_Technical();
    init_News();
    init_InstrumentService();
    init_YahooFinance();
    init_ZpiIdxClient();
  }
});

// src/server/services/candidates/Scoring.ts
function hasNumber(value) {
  return value != null && Number.isFinite(value);
}
function setupResult(row, setup, filters) {
  if (setup === "fundamental") {
    const reasons = [];
    const fundRaw = row.fundamentalScore ?? (row.qualityScore != null ? row.qualityScore * 100 : 0);
    const valRaw = row.valuationScore ?? (row.valueScore != null ? row.valueScore * 100 : 0);
    let momRaw = 0;
    if (row.momentumScore != null) {
      momRaw = row.momentumScore > 1 ? row.momentumScore : row.momentumScore * 100;
    } else if (row.week13PC != null) {
      momRaw = row.week13PC;
    }
    const liqRaw = row.liquidityScore ?? (() => {
      const v = row.avgValue20 ?? row.value ?? 0;
      const vol = row.avgVolume20 ?? row.volume ?? 0;
      if (v <= 0 && vol <= 0) {
        return 0;
      }
      const vScore = v >= 1e10 ? 100 : v / 1e10 * 100;
      const volScore = vol >= 1e6 ? 100 : vol / 1e6 * 100;
      return Math.round((vScore + volScore) / 2 * 100) / 100;
    })();
    const score2 = Math.round((0.4 * fundRaw + 0.3 * valRaw + 0.2 * momRaw + 0.1 * liqRaw) * 100) / 100;
    const fPerMin = filters?.perMin;
    const fPerMax = filters?.perMax;
    const fRoeMin = filters?.roeMin;
    const fDerMax = filters?.derMax;
    const fMomentumMin = filters?.momentumMin;
    const fMinValue = filters?.minValue;
    const fMinVolume = filters?.minVolume;
    if (fPerMin != null && hasNumber(row.per) && row.per < fPerMin) {
      reasons.push(`PER >= ${fPerMin}`);
    }
    if (fPerMax != null && hasNumber(row.per) && row.per > fPerMax) {
      reasons.push(`PER <= ${fPerMax}`);
    }
    if (fRoeMin != null && hasNumber(row.roe) && row.roe < fRoeMin) {
      reasons.push(`ROE >= ${fRoeMin}%`);
    }
    if (fDerMax != null && hasNumber(row.der) && row.der > fDerMax) {
      reasons.push(`DER <= ${fDerMax}`);
    }
    const labelMomentum = row.selectedMomentumPC ?? row.week13PC ?? row.momentumScore ?? 0;
    if (fMomentumMin != null && hasNumber(labelMomentum) && labelMomentum < fMomentumMin) {
      reasons.push(`Momentum >= ${fMomentumMin}%`);
    }
    if (fMinValue != null) {
      const v = row.avgValue20 ?? row.value ?? 0;
      if (v < fMinValue) {
        reasons.push(`Avg value >= ${fMinValue}`);
      }
    }
    if (fMinVolume != null) {
      const vol = row.avgVolume20 ?? row.volume ?? 0;
      if (vol < fMinVolume) {
        reasons.push(`Avg volume >= ${fMinVolume}`);
      }
    }
    if (row.hasNotation) {
      reasons.push("Has notation");
    }
    if (row.hasUma) {
      reasons.push("Has UMA");
    }
    if (row.hasCorpAction) {
      reasons.push("Has corporate action");
    }
    let label = null;
    if ((row.roe ?? 0) > 18 && (row.der ?? 99) < 0.5 && labelMomentum > 15) {
      label = "A+ Quality Compounder";
    } else if ((row.roe ?? 0) > 15 && (row.per ?? 999999) < 15 && labelMomentum > 10) {
      label = "A Value Growth";
    } else if ((row.roe ?? 0) >= (filters?.roeMin ?? 8)) {
      label = "B Watchlist";
    } else {
      label = "C Avoid";
    }
    const pass = reasons.length === 0;
    return { pass, score: score2, label, reasons };
  }
  const conditions = setup === "rebound" ? [
    { pass: hasNumber(row.volume) && row.volume >= 1e6, reason: "Vol > 1M" },
    { pass: hasNumber(row.relVolume) && row.relVolume > 1.2, reason: "Rel vol > 1.2" },
    {
      pass: hasNumber(row.rsi14) && row.rsi14 >= 25 && row.rsi14 <= 60,
      reason: "RSI 25-60"
    },
    {
      pass: hasNumber(row.price) && hasNumber(row.ema10) && row.price > row.ema10,
      reason: "Price > EMA10"
    },
    {
      pass: hasNumber(row.price) && hasNumber(row.ema200) && row.price < row.ema200,
      reason: "Price < EMA200"
    },
    { pass: hasNumber(row.changePct) && row.changePct > 0, reason: "Chg > 0%" }
  ] : [
    {
      pass: hasNumber(row.marketCapital) && row.marketCapital >= 1e11 && row.marketCapital <= 2e13,
      reason: "MCap 100B-20T"
    },
    {
      pass: hasNumber(row.bbBasis20) && hasNumber(row.price) && row.bbBasis20 < row.price,
      reason: "Price > BB basis"
    },
    { pass: hasNumber(row.volume) && row.volume > 5e6, reason: "Vol > 5M" },
    {
      pass: hasNumber(row.plusDi14) && hasNumber(row.minusDi14) && row.plusDi14 > row.minusDi14,
      reason: "DMI+ > DMI-"
    },
    { pass: hasNumber(row.momentum10) && row.momentum10 > 0, reason: "Mom10 > 0" },
    { pass: hasNumber(row.relVolume) && row.relVolume > 0.5, reason: "Rel vol > 0.5" },
    {
      pass: hasNumber(row.ema20) && hasNumber(row.ema50) && row.ema20 > row.ema50,
      reason: "EMA20 > EMA50"
    },
    { pass: hasNumber(row.adx14) && row.adx14 > 18, reason: "ADX > 18" }
  ];
  const passed = conditions.filter((condition) => condition.pass);
  const score = Math.round(passed.length / conditions.length * 100);
  return {
    pass: setup === "rebound" ? passed.length === conditions.length : score >= 75,
    score,
    label: setup === "rebound" ? "Rebound Day" : "Swing Trade",
    reasons: passed.map((condition) => condition.reason)
  };
}
function mergeScreenerAndTechnical(rankedRows, context) {
  return rankedRows.map((row) => {
    const flags = context.codeToFlags.get(row.code);
    const hasNotation = Utils.isNonEmptyString(flags?.notation);
    const hasCorpAction = Utils.isNonEmptyString(flags?.corpAction);
    const hasUma = Utils.isNonEmptyString(flags?.umaDate);
    const liquidity = context.codeToLiquidity.get(row.code);
    const transactionValue = liquidity?.value ?? null;
    const volume = liquidity?.volume ?? null;
    const fundamentals = context.codeToFundamentals.get(row.code);
    const changePct = context.codeToChangePct.get(row.code) ?? null;
    const technical = context.codeToTechnical.get(row.code);
    return {
      ...row,
      hasNotation,
      hasCorpAction,
      hasUma,
      marketCapital: context.codeToMarketCapital.get(row.code) ?? null,
      per: fundamentals?.per ?? null,
      pbv: fundamentals?.pbv ?? null,
      roa: fundamentals?.roa ?? null,
      roe: fundamentals?.roe ?? null,
      der: fundamentals?.der ?? null,
      week1PC: fundamentals?.week1PC ?? null,
      week4PC: fundamentals?.week4PC ?? null,
      week13PC: fundamentals?.week13PC ?? null,
      week26PC: fundamentals?.week26PC ?? null,
      week52PC: fundamentals?.week52PC ?? null,
      npm: fundamentals?.npm ?? null,
      value: transactionValue,
      volume,
      changePct,
      price: technical?.price ?? null,
      rsi14: technical?.rsi14 ?? null,
      relVolume: technical?.relVolume ?? null,
      ema10: technical?.ema10 ?? null,
      ema20: technical?.ema20 ?? null,
      ema50: technical?.ema50 ?? null,
      ema200: technical?.ema200 ?? null,
      bbBasis20: technical?.bbBasis20 ?? null,
      momentum10: technical?.momentum10 ?? null,
      adx14: technical?.adx14 ?? null,
      plusDi14: technical?.plusDi14 ?? null,
      minusDi14: technical?.minusDi14 ?? null,
      recommendationScore: 0,
      recommendationLabel: null,
      recommendationReasons: [],
      compositePercentile: 0
    };
  });
}
function enhanceCandidates(candidates, context) {
  const avgVolList = [];
  const avgValList = [];
  for (const r of candidates) {
    const av = context.codeToAvgVolume20.get(r.code) ?? null;
    const avv = context.codeToAvgValue20.get(r.code) ?? null;
    if (av != null && Number.isFinite(av)) {
      avgVolList.push(av);
    }
    if (avv != null && Number.isFinite(avv)) {
      avgValList.push(avv);
    }
  }
  const minMax = (arr) => {
    if (arr.length === 0) {
      return { min: 0, max: 0 };
    }
    return { min: Math.min(...arr), max: Math.max(...arr) };
  };
  const volRange = minMax(avgVolList);
  const valRange = minMax(avgValList);
  const periodReturns = context.rowsForScore.map((r) => {
    const week = context.momentumWeek;
    return week === 1 ? r.week1PC ?? 0 : week === 4 ? r.week4PC ?? 0 : week === 13 ? r.week13PC ?? 0 : r.week26PC ?? 0;
  });
  const indexReturnAvg = periodReturns.length > 0 ? periodReturns.reduce((s, x) => s + x, 0) / periodReturns.length : 0;
  const codeToRanked = new Map(context.rankedRows.map((r) => [r.code, r]));
  const enhancedCandidates = [];
  for (const row of candidates) {
    const avgVol = context.codeToAvgVolume20.get(row.code) ?? null;
    const avgVal = context.codeToAvgValue20.get(row.code) ?? null;
    const ranked = codeToRanked.get(row.code);
    const fundamentalScore = ranked ? (ranked.qualityScore ?? 0) * 100 : 0;
    const valuationScore = ranked ? (ranked.valueScore ?? 0) * 100 : 0;
    const momentumScore = ranked ? (ranked.momentumScore ?? 0) * 100 : 0;
    const normVol = avgVol != null && volRange.max > volRange.min ? (avgVol - volRange.min) / (volRange.max - volRange.min) : avgVol != null ? 0.5 : 0;
    const normVal = avgVal != null && valRange.max > valRange.min ? (avgVal - valRange.min) / (valRange.max - valRange.min) : avgVal != null ? 0.5 : 0;
    const liquidityScore = Math.round((normVol + normVal) / 2 * 1e4) / 100;
    const totalScore = Math.round(
      (0.4 * fundamentalScore + 0.3 * valuationScore + 0.2 * momentumScore + 0.1 * liquidityScore) * 100
    ) / 100;
    const stockReturn = context.momentumWeek === 1 ? row.week1PC ?? 0 : context.momentumWeek === 4 ? row.week4PC ?? 0 : context.momentumWeek === 13 ? row.week13PC ?? 0 : row.week26PC ?? 0;
    const relativeStrength = stockReturn - (indexReturnAvg ?? 0);
    const bullishTrend = row.price != null && row.ema20 != null && row.ema50 != null && row.ema200 != null && row.price > row.ema20 && row.ema20 > row.ema50 && row.ema50 > row.ema200;
    const earlyReversal = row.price != null && row.ema20 != null && row.rsi14 != null && avgVol != null && row.price > row.ema20 && row.rsi14 > 50 && (row.volume ?? 0) > avgVol;
    const smartMoney = avgVol != null && row.volume != null && row.relVolume != null && row.volume > avgVol * 1.2 && row.relVolume > 1.5 && row.price != null && row.ema20 != null && row.price > row.ema20;
    enhancedCandidates.push({
      ...row,
      fundamentalScore,
      valuationScore,
      momentumScore,
      liquidityScore,
      totalScore,
      avgVolume20: avgVol,
      avgValue20: avgVal,
      relativeStrength,
      selectedMomentumPC: stockReturn,
      bullishTrend,
      earlyReversal,
      smartMoney
    });
  }
  return enhancedCandidates;
}
function applySignalFilters(candidates, filters) {
  let filtered = candidates;
  if (filters.relativeStrengthMin != null) {
    filtered = filtered.filter(
      (r) => (r.relativeStrength ?? 0) >= filters.relativeStrengthMin
    );
  }
  if (filters.smartMoneyOnly) {
    filtered = filtered.filter((r) => r.smartMoney === true);
  }
  if (filters.requireBullishTrend) {
    filtered = filtered.filter((r) => r.bullishTrend === true);
  }
  if (filters.requireEarlyReversal) {
    filtered = filtered.filter((r) => r.earlyReversal === true);
  }
  return filtered;
}
function applySectorRanks(candidates) {
  const bySector = /* @__PURE__ */ new Map();
  for (const row of candidates) {
    Utils.pushToMapList(bySector, row.sector ?? "", row);
  }
  const candidatesWithSectorRank = [];
  for (const sectorRows of bySector.values()) {
    sectorRows.sort((a, b2) => b2.compositeScore - a.compositeScore);
    const sectorCount = sectorRows.length;
    sectorRows.forEach((candidateRow, index2) => {
      const sectorRank = index2 + 1;
      const sectorPercentile = Utils.sectorPercentile(sectorRank, sectorCount);
      candidatesWithSectorRank.push({
        ...candidateRow,
        sectorRank,
        sectorPercentile
      });
    });
  }
  candidatesWithSectorRank.sort((a, b2) => b2.compositeScore - a.compositeScore);
  return candidatesWithSectorRank;
}
function applyExclusionFilters(candidates, filters) {
  let filtered = candidates;
  if (filters.excludeNotation) {
    filtered = filtered.filter((row) => !row.hasNotation);
  }
  if (filters.excludeCorpAction) {
    filtered = filtered.filter((row) => !row.hasCorpAction);
  }
  if (filters.excludeUma) {
    filtered = filtered.filter((row) => !row.hasUma);
  }
  if (filters.minValue != null) {
    filtered = filtered.filter((row) => {
      const v = row.avgValue20 ?? row.value ?? 0;
      return v >= filters.minValue;
    });
  }
  if (filters.minVolume != null) {
    filtered = filtered.filter((row) => {
      const vol = row.avgVolume20 ?? row.volume ?? 0;
      return vol >= filters.minVolume;
    });
  }
  return filtered;
}
function applySetupMapping(candidates, setup, includeRejected, filters) {
  return candidates.map((row) => {
    const result = setupResult(row, setup, filters);
    return {
      ...row,
      recommendationScore: result.score,
      recommendationLabel: result.label,
      recommendationReasons: result.reasons
    };
  }).filter((row) => includeRejected || setupResult(row, setup, filters).pass);
}
function sortCandidates(candidates, setup) {
  const sorted = [...candidates];
  if (setup === "fundamental") {
    sorted.sort(
      (a, b2) => b2.recommendationScore - a.recommendationScore || (b2.roe ?? 0) - (a.roe ?? 0) || (b2.momentumScore ?? 0) - (a.momentumScore ?? 0) || // cheaper PER first
      (a.per ?? Number.MAX_VALUE) - (b2.per ?? Number.MAX_VALUE) || (b2.liquidityScore ?? 0) - (a.liquidityScore ?? 0)
    );
  } else {
    sorted.sort(
      (a, b2) => b2.recommendationScore - a.recommendationScore || b2.compositeScore - a.compositeScore
    );
  }
  return sorted;
}
function applySectorAndSearchFilters(candidates, sector, search) {
  let filtered = candidates;
  if (sector !== void 0) {
    filtered = filtered.filter(
      (row) => row.sector != null && row.sector.trim() === sector
    );
  }
  if (search !== void 0) {
    filtered = filtered.filter((row) => {
      const code = row.code?.toLowerCase() ?? "";
      const name = row.name?.toLowerCase() ?? "";
      const sectorLower = row.sector?.toLowerCase() ?? "";
      return code.includes(search) || name.includes(search) || sectorLower.includes(search);
    });
  }
  return filtered;
}
function finalRankingSort(candidates) {
  const sorted = [...candidates];
  sorted.sort(
    (a, b2) => (b2.recommendationScore ?? b2.totalScore ?? 0) - (a.recommendationScore ?? a.totalScore ?? 0) || (b2.roe ?? 0) - (a.roe ?? 0) || (b2.momentumScore ?? 0) - (a.momentumScore ?? 0) || (a.per ?? Number.MAX_VALUE) - (b2.per ?? Number.MAX_VALUE) || (b2.liquidityScore ?? 0) - (a.liquidityScore ?? 0)
  );
  return sorted;
}
var init_Scoring = __esm({
  "src/server/services/candidates/Scoring.ts"() {
    init_Utils();
  }
});

// src/server/services/candidates/SentimentService.ts
var TTL_MS, MAX_ENTRIES, cache, SentimentService;
var init_SentimentService = __esm({
  "src/server/services/candidates/SentimentService.ts"() {
    init_services();
    TTL_MS = 30 * 60 * 1e3;
    MAX_ENTRIES = 200;
    cache = /* @__PURE__ */ new Map();
    SentimentService = class _SentimentService {
      news;
      constructor() {
        this.news = new News(new Client());
      }
      static async scoreCompany(code, name) {
        return new _SentimentService().scoreCompany(code, name);
      }
      async scoreCompany(code, name) {
        const key = `${code}:${name ?? ""}`;
        const cached = cache.get(key);
        if (cached != null && cached.expiresAt > Date.now()) {
          return cached.result;
        }
        const result = await this.news.scoreCompany(code, name);
        cache.set(key, { expiresAt: Date.now() + TTL_MS, result });
        if (cache.size > MAX_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey !== void 0) {
            cache.delete(oldestKey);
          }
        }
        return result;
      }
    };
  }
});

// src/server/use-cases/candidates/queryParser.ts
function getTradingSetup(raw) {
  return raw === "rebound" || raw === "swing" ? raw : "fundamental";
}
function parseCandidateQuery(query) {
  const setup = getTradingSetup(Utils.queryString(query("setup")));
  const minValueRaw = query("minValue");
  const minVolumeRaw = query("minVolume");
  const excludeNotationRaw = query("excludeNotation");
  const excludeCorpActionRaw = query("excludeCorpAction");
  const excludeUmaRaw = query("excludeUma");
  let minValue = Utils.parseNumber(Utils.queryString(minValueRaw));
  let minVolume = Utils.parseNumber(Utils.queryString(minVolumeRaw));
  let excludeNotation = Utils.parseBoolean(Utils.queryString(excludeNotationRaw));
  let excludeCorpAction = Utils.parseBoolean(Utils.queryString(excludeCorpActionRaw));
  let excludeUma = Utils.parseBoolean(Utils.queryString(excludeUmaRaw));
  const perMinRaw = query("perMin");
  const perMaxRaw = query("perMax");
  const roeMinRaw = query("roeMin");
  const derMaxRaw = query("derMax");
  const pbvMaxRaw = query("pbvMax");
  const minMarketCapitalRaw = query("minMarketCapital");
  const netMarginMinRaw = query("netMarginMin");
  const momentumWeekRaw = query("momentumWeek");
  const momentumMinRaw = query("momentumMin");
  const relativeStrengthRaw = query("relativeStrengthMin");
  const smartMoneyOnlyRaw = query("smartMoneyOnly");
  const requireBullishTrendRaw = query("requireBullishTrend");
  const requireEarlyReversalRaw = query("requireEarlyReversal");
  let perMin = Utils.parseNumber(Utils.queryString(perMinRaw));
  let perMax = Utils.parseNumber(Utils.queryString(perMaxRaw));
  let roeMin = Utils.parseNumber(Utils.queryString(roeMinRaw));
  let derMax = Utils.parseNumber(Utils.queryString(derMaxRaw));
  let pbvMax = Utils.parseNumber(Utils.queryString(pbvMaxRaw));
  let minMarketCapital = Utils.parseNumber(Utils.queryString(minMarketCapitalRaw));
  let netMarginMin = Utils.parseNumber(Utils.queryString(netMarginMinRaw));
  let momentumMin = Utils.parseNumber(Utils.queryString(momentumMinRaw));
  let momentumWeek = Utils.parseWeek(Utils.queryString(momentumWeekRaw));
  const relativeStrengthMin = Utils.parseNumber(Utils.queryString(relativeStrengthRaw));
  const smartMoneyOnly = Utils.parseBoolean(Utils.queryString(smartMoneyOnlyRaw));
  const requireBullishTrend = Utils.parseBoolean(Utils.queryString(requireBullishTrendRaw));
  const requireEarlyReversal = Utils.parseBoolean(Utils.queryString(requireEarlyReversalRaw));
  const defaultFilter = Utils.parseBoolean(Utils.queryString(query("defaultFilter")));
  const includeRejected = Utils.parseBoolean(Utils.queryString(query("includeRejected")));
  if (defaultFilter) {
    if (!Utils.queryParamSent(excludeNotationRaw)) {
      excludeNotation = true;
    }
    if (!Utils.queryParamSent(excludeCorpActionRaw)) {
      excludeCorpAction = true;
    }
    if (!Utils.queryParamSent(excludeUmaRaw)) {
      excludeUma = true;
    }
    if (!Utils.queryParamSent(perMinRaw)) {
      perMin = defaultCandidateFilters.perMin;
    }
    if (!Utils.queryParamSent(perMaxRaw)) {
      perMax = defaultCandidateFilters.perMax;
    }
    if (!Utils.queryParamSent(roeMinRaw)) {
      roeMin = defaultCandidateFilters.roeMin;
    }
    if (!Utils.queryParamSent(derMaxRaw)) {
      derMax = defaultCandidateFilters.derMax;
    }
    if (!Utils.queryParamSent(momentumWeekRaw)) {
      momentumWeek = defaultMomentumWeekBySetup[setup];
    }
    if (!Utils.queryParamSent(momentumMinRaw)) {
      momentumMin = defaultCandidateFilters.momentumMin;
    }
    if (!Utils.queryParamSent(minValueRaw)) {
      minValue = defaultCandidateFilters.minValue;
    }
    if (!Utils.queryParamSent(minVolumeRaw)) {
      minVolume = defaultCandidateFilters.minVolume;
    }
    if (!Utils.queryParamSent(pbvMaxRaw)) {
      pbvMax = void 0;
    }
    if (!Utils.queryParamSent(minMarketCapitalRaw)) {
      minMarketCapital = void 0;
    }
    if (!Utils.queryParamSent(netMarginMinRaw)) {
      netMarginMin = void 0;
    }
  }
  const { limit, offset } = Utils.parseLimitOffset(
    Utils.queryString(query("limit")),
    Utils.queryString(query("offset"))
  );
  const withSectorRank = Utils.parseBoolean(Utils.queryString(query("withSectorRank")));
  const valueWeight = Utils.parseWeight(Utils.queryString(query("vw")));
  const qualityWeight = Utils.parseWeight(Utils.queryString(query("qw")));
  const momentumWeight = Utils.parseWeight(Utils.queryString(query("mw")));
  const compositeWeights = Utils.buildCompositeWeights(
    valueWeight,
    qualityWeight,
    momentumWeight
  );
  const sectorParam = Utils.queryString(query("sector"))?.trim();
  const searchParam = Utils.queryString(query("search"))?.trim().toLowerCase();
  const requireNewsSentiment = Utils.parseBoolean(Utils.queryString(query("requireNewsSentiment")));
  const minNewsSentiment = Utils.parseNumber(Utils.queryString(query("minNewsSentiment")));
  return {
    setup,
    minValue,
    minVolume,
    excludeNotation,
    excludeCorpAction,
    excludeUma,
    perMin,
    perMax,
    roeMin,
    derMax,
    pbvMax,
    minMarketCapital,
    netMarginMin,
    momentumWeek,
    momentumMin,
    relativeStrengthMin,
    smartMoneyOnly,
    requireBullishTrend,
    requireEarlyReversal,
    defaultFilter,
    includeRejected,
    limit,
    offset,
    withSectorRank,
    compositeWeights,
    sector: sectorParam !== void 0 && sectorParam !== "" ? sectorParam : void 0,
    search: searchParam !== void 0 && searchParam !== "" ? searchParam : void 0,
    requireNewsSentiment,
    minNewsSentiment
  };
}
var defaultCandidateFilters, defaultMomentumWeekBySetup;
var init_queryParser = __esm({
  "src/server/use-cases/candidates/queryParser.ts"() {
    init_Utils();
    defaultCandidateFilters = {
      perMin: 0,
      perMax: 25,
      roeMin: 8,
      derMax: 1.5,
      momentumMin: 5,
      minValue: 5e9,
      minVolume: 5e5
    };
    defaultMomentumWeekBySetup = {
      fundamental: 13,
      rebound: 1,
      swing: 13
    };
  }
});

// src/server/repositories/StockMarketDataRepository.ts
function computeReturnForWeek(rows, endDate, week) {
  const startDate = Utils.addDaysToDateInt(endDate, -week * 7);
  const periodRows = rows.filter((row) => row.date >= startDate && row.date <= endDate && row.priceClose != null).sort((a, b2) => a.date - b2.date);
  const firstClose = periodRows[0]?.priceClose;
  const lastClose = periodRows[periodRows.length - 1]?.priceClose;
  if (firstClose == null || lastClose == null) {
    return null;
  }
  return Utils.returnPctFromPrices(firstClose, lastClose);
}
function clearMarketDataCache() {
  marketDataCache.clear();
}
async function loadMarketData(dateInt) {
  const cached = marketDataCache.get(dateInt);
  if (cached != null && Date.now() - cached.timestamp < CACHE_TTL_MS3) {
    return cached.data;
  }
  let summaryDate = dateInt;
  let summaryRows = await Database_default.select({
    stockCode: summary.stockCode,
    value: summary.value,
    volume: summary.volume,
    change: summary.change,
    previous: summary.previous
  }).from(summary).where(eq(summary.date, dateInt));
  if (summaryRows.length === 0) {
    const latestRows = await Database_default.select({ date: summary.date }).from(summary).orderBy(desc(summary.date)).limit(1);
    const latestDate = latestRows[0]?.date;
    if (latestDate != null && Number.isFinite(latestDate)) {
      summaryDate = Number(latestDate);
      summaryRows = await Database_default.select({
        stockCode: summary.stockCode,
        value: summary.value,
        volume: summary.volume,
        change: summary.change,
        previous: summary.previous
      }).from(summary).where(eq(summary.date, summaryDate));
    }
  }
  const codeToLiquidity = /* @__PURE__ */ new Map();
  const codeToChangePct = /* @__PURE__ */ new Map();
  for (const row of summaryRows) {
    codeToLiquidity.set(row.stockCode, {
      value: row.value,
      volume: row.volume
    });
    const changePct = Utils.changePctFromPrevious(row.change, row.previous);
    codeToChangePct.set(row.stockCode, changePct);
  }
  const historyStart = Utils.addDaysToDateInt(summaryDate, -460);
  const historyRows = await Database_default.select({
    stockCode: summary.stockCode,
    date: summary.date,
    priceHigh: summary.priceHigh,
    priceLow: summary.priceLow,
    priceClose: summary.priceClose,
    volume: summary.volume
  }).from(summary).where(and(gte(summary.date, historyStart), lte(summary.date, summaryDate)));
  const codeToTechnical = Technical.computeByCode(
    historyRows.map((row) => ({
      stockCode: row.stockCode,
      date: Number(row.date),
      priceHigh: row.priceHigh,
      priceLow: row.priceLow,
      priceClose: row.priceClose,
      volume: row.volume
    }))
  );
  const rowsByCode = /* @__PURE__ */ new Map();
  for (const r of historyRows) {
    const list = rowsByCode.get(r.stockCode) ?? [];
    list.push(r);
    rowsByCode.set(r.stockCode, list);
  }
  const codeToAvgVolume20 = /* @__PURE__ */ new Map();
  const codeToAvgValue20 = /* @__PURE__ */ new Map();
  const codeToReturnByWeek = /* @__PURE__ */ new Map();
  for (const [code, rows] of rowsByCode.entries()) {
    const sorted = rows.sort((a, b2) => Number(a.date) - Number(b2.date));
    const volumes = sorted.map((r) => r.volume).filter((v) => v != null);
    const closes = sorted.map((r) => r.priceClose).filter((v) => v != null);
    const prevVolumes = volumes.length > 1 ? volumes.slice(-21, -1) : [];
    const avgVol = prevVolumes.length > 0 ? prevVolumes.reduce((s, x) => s + x, 0) / prevVolumes.length : null;
    const avgClose = closes.length > 0 ? closes[closes.length - 1] ?? null : null;
    codeToAvgVolume20.set(code, avgVol);
    codeToAvgValue20.set(code, avgVol != null && avgClose != null ? avgVol * avgClose : null);
    const periodRows = sorted.map((row) => ({
      date: Number(row.date),
      priceClose: row.priceClose != null ? Number(row.priceClose) : null
    }));
    codeToReturnByWeek.set(
      code,
      /* @__PURE__ */ new Map([
        [1, computeReturnForWeek(periodRows, summaryDate, 1)],
        [4, computeReturnForWeek(periodRows, summaryDate, 4)],
        [13, computeReturnForWeek(periodRows, summaryDate, 13)],
        [26, computeReturnForWeek(periodRows, summaryDate, 26)]
      ])
    );
  }
  const screenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    sector: screener.sector,
    marketCapital: screener.marketCapital,
    per: screener.per,
    pbv: screener.pbv,
    roa: screener.roa,
    roe: screener.roe,
    der: screener.der,
    week4PC: screener.week4PC,
    week13PC: screener.week13PC,
    week26PC: screener.week26PC,
    week52PC: screener.week52PC,
    npm: screener.npm,
    notation: screener.notation,
    corpAction: screener.corpAction,
    umaDate: screener.umaDate
  }).from(screener);
  const result = {
    summaryDate,
    codeToLiquidity,
    codeToChangePct,
    codeToTechnical,
    codeToAvgVolume20,
    codeToAvgValue20,
    codeToReturnByWeek,
    screenerRows
  };
  marketDataCache.set(dateInt, { data: result, timestamp: Date.now() });
  return result;
}
var CACHE_TTL_MS3, marketDataCache;
var init_StockMarketDataRepository = __esm({
  "src/server/repositories/StockMarketDataRepository.ts"() {
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
    init_services();
    CACHE_TTL_MS3 = 30 * 60 * 1e3;
    marketDataCache = /* @__PURE__ */ new Map();
  }
});

// src/server/routes/api/candidates.ts
async function GET3(ctx) {
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query("date")));
  const dateInt = dateParsed ?? CronDate.todayDateInt();
  const params = parseCandidateQuery((name) => ctx.query(name));
  const bundle = await loadMarketData(dateInt);
  console.info(`[candidates] date=${bundle.summaryDate} screenerRows=${bundle.screenerRows.length} codesWithLiquidity=${bundle.codeToLiquidity.size}`);
  const fundamentalFilter = {
    ...params.perMin != null && { perMin: params.perMin },
    ...params.perMax != null && { perMax: params.perMax },
    ...params.roeMin != null && { roeMin: params.roeMin },
    ...params.derMax != null && { derMax: params.derMax },
    ...params.pbvMax != null && { pbvMax: params.pbvMax },
    ...params.minMarketCapital != null && { minMarketCapital: params.minMarketCapital },
    ...params.netMarginMin != null && { netMarginMin: params.netMarginMin },
    ...params.momentumMin != null && { momentumMin: params.momentumMin },
    momentumWeek: params.momentumWeek
  };
  const screenerRowsWithShortMomentum = bundle.screenerRows.map((row) => ({
    ...row,
    week1PC: bundle.codeToReturnByWeek.get(row.code)?.get(1) ?? null,
    week4PC: bundle.codeToReturnByWeek.get(row.code)?.get(4) ?? row.week4PC,
    week13PC: bundle.codeToReturnByWeek.get(row.code)?.get(13) ?? row.week13PC,
    week26PC: bundle.codeToReturnByWeek.get(row.code)?.get(26) ?? row.week26PC
  }));
  const filteredScreenerRows = screenerRowsWithShortMomentum.filter(
    (row) => Utils.screenerPassesFundamentalFilter(row, fundamentalFilter)
  );
  console.info(`[candidates] after fundamental filter: ${filteredScreenerRows.length}/${screenerRowsWithShortMomentum.length}`);
  const rowsForScore = filteredScreenerRows.map((row) => ({
    code: row.code,
    name: row.name,
    sector: row.sector,
    per: row.per,
    pbv: row.pbv,
    roa: row.roa,
    roe: row.roe,
    der: row.der,
    week1PC: row.week1PC,
    week4PC: row.week4PC,
    week13PC: row.week13PC,
    week26PC: row.week26PC,
    week52PC: row.week52PC
  }));
  const rankedRows = Composite.computeRanked(rowsForScore, params.compositeWeights);
  const codeToFlags = /* @__PURE__ */ new Map();
  for (const row of filteredScreenerRows) {
    codeToFlags.set(row.code, {
      notation: row.notation,
      corpAction: row.corpAction,
      umaDate: row.umaDate
    });
  }
  const codeToFundamentals = Utils.toFundamentalsMap(filteredScreenerRows);
  const codeToMarketCapital = /* @__PURE__ */ new Map();
  for (const row of filteredScreenerRows) {
    codeToMarketCapital.set(row.code, row.marketCapital ?? null);
  }
  const merged = mergeScreenerAndTechnical(rankedRows, {
    codeToFlags,
    codeToLiquidity: bundle.codeToLiquidity,
    codeToFundamentals,
    codeToMarketCapital,
    codeToChangePct: bundle.codeToChangePct,
    codeToTechnical: bundle.codeToTechnical
  });
  const enhanced = enhanceCandidates(merged, {
    codeToAvgVolume20: bundle.codeToAvgVolume20,
    codeToAvgValue20: bundle.codeToAvgValue20,
    rankedRows,
    rowsForScore,
    momentumWeek: params.momentumWeek
  });
  let filteredCandidates = applySignalFilters(enhanced, {
    relativeStrengthMin: params.relativeStrengthMin,
    smartMoneyOnly: params.smartMoneyOnly,
    requireBullishTrend: params.requireBullishTrend,
    requireEarlyReversal: params.requireEarlyReversal
  });
  console.info(`[candidates] after signal filters: ${filteredCandidates.length}`);
  if (params.withSectorRank) {
    filteredCandidates = applySectorRanks(filteredCandidates);
  }
  filteredCandidates = applyExclusionFilters(filteredCandidates, {
    excludeNotation: params.excludeNotation,
    excludeCorpAction: params.excludeCorpAction,
    excludeUma: params.excludeUma,
    minValue: params.minValue,
    minVolume: params.minVolume,
    setup: params.setup
  });
  console.info(`[candidates] after exclusion filters: ${filteredCandidates.length}`);
  filteredCandidates = applySetupMapping(
    filteredCandidates,
    params.setup,
    params.includeRejected,
    {
      perMin: params.perMin,
      perMax: params.perMax,
      roeMin: params.roeMin,
      derMax: params.derMax,
      momentumMin: params.momentumMin,
      minValue: params.minValue,
      minVolume: params.minVolume
    }
  );
  console.info(`[candidates] after setup mapping (${params.setup}): ${filteredCandidates.length}`);
  filteredCandidates = sortCandidates(filteredCandidates, params.setup);
  filteredCandidates = applySectorAndSearchFilters(
    filteredCandidates,
    params.sector,
    params.search
  );
  const totalCount = filteredCandidates.length;
  filteredCandidates = finalRankingSort(filteredCandidates);
  const withPercentile = filteredCandidates.map((row, index2) => ({
    ...row,
    compositePercentile: Utils.compositePercentile(index2, totalCount)
  }));
  const { data } = Utils.applyPagination(withPercentile, params.offset, params.limit);
  const dataWithSentiment = data;
  if (params.requireNewsSentiment) {
    const sentimentService = new SentimentService();
    await Promise.all(dataWithSentiment.map(async (row) => {
      try {
        const { score, count: count2, label, titles } = await sentimentService.scoreCompany(
          row.code,
          row.name
        );
        row.newsSentimentScore = score;
        row.newsSentimentCount = count2;
        row.newsSentimentLabel = label;
        row.newsSentimentTitles = titles;
        if (count2 === 0) {
          console.info(`[candidates] no news articles for ${row.code}`);
        }
      } catch (_e) {
        row.newsSentimentScore = 0;
        row.newsSentimentCount = 0;
        row.newsSentimentLabel = "neutral";
        row.newsSentimentTitles = [];
      }
    }));
    if (params.minNewsSentiment != null) {
      for (let i = dataWithSentiment.length - 1; i >= 0; i--) {
        const s = dataWithSentiment[i]?.newsSentimentScore ?? 0;
        if (s < params.minNewsSentiment) {
          dataWithSentiment.splice(i, 1);
        }
      }
    }
  }
  const response = {
    date: bundle.summaryDate,
    totalCount,
    limit: params.limit,
    offset: params.offset,
    serverTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
    data: dataWithSentiment
  };
  return ctx.send.json(response);
}
var init_candidates = __esm({
  "src/server/routes/api/candidates.ts"() {
    init_Utils();
    init_services();
    init_Scoring();
    init_SentimentService();
    init_queryParser();
    init_StockMarketDataRepository();
  }
});

// src/server/routes/api/screener/ranked.ts
async function GET4(ctx) {
  const { limit, offset } = Utils.parseLimitOffset(
    Utils.queryString(ctx.query("limit")),
    Utils.queryString(ctx.query("offset"))
  );
  const valueWeightRaw = ctx.query("vw");
  const qualityWeightRaw = ctx.query("qw");
  const momentumWeightRaw = ctx.query("mw");
  const valueWeight = Utils.parseWeight(Utils.queryString(valueWeightRaw));
  const qualityWeight = Utils.parseWeight(Utils.queryString(qualityWeightRaw));
  const momentumWeight = Utils.parseWeight(Utils.queryString(momentumWeightRaw));
  const compositeWeights = Utils.buildCompositeWeights(
    valueWeight,
    qualityWeight,
    momentumWeight
  );
  const screenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    sector: screener.sector,
    per: screener.per,
    pbv: screener.pbv,
    roa: screener.roa,
    roe: screener.roe,
    der: screener.der,
    week26PC: screener.week26PC,
    week52PC: screener.week52PC,
    notation: screener.notation,
    corpAction: screener.corpAction,
    umaDate: screener.umaDate
  }).from(screener);
  const rowsForScore = screenerRows.map((row) => ({
    code: row.code,
    name: row.name,
    sector: row.sector,
    per: row.per,
    pbv: row.pbv,
    roa: row.roa,
    roe: row.roe,
    der: row.der,
    week26PC: row.week26PC,
    week52PC: row.week52PC
  }));
  const rankedRows = Composite.computeRanked(rowsForScore, compositeWeights);
  const codeToFlags = /* @__PURE__ */ new Map();
  for (const row of screenerRows) {
    codeToFlags.set(row.code, {
      notation: row.notation,
      corpAction: row.corpAction,
      umaDate: row.umaDate
    });
  }
  const codeToFundamentals = Utils.toFundamentalsMap(screenerRows);
  const withFlags = rankedRows.map((row) => {
    const flags = codeToFlags.get(row.code);
    const hasNotation = Utils.isNonEmptyString(flags?.notation);
    const hasCorpAction = Utils.isNonEmptyString(flags?.corpAction);
    const hasUma = Utils.isNonEmptyString(flags?.umaDate);
    const fundamentals = codeToFundamentals.get(row.code);
    return {
      ...row,
      hasNotation,
      hasCorpAction,
      hasUma,
      per: fundamentals?.per ?? null,
      roe: fundamentals?.roe ?? null,
      der: fundamentals?.der ?? null,
      week26PC: fundamentals?.week26PC ?? null,
      week52PC: fundamentals?.week52PC ?? null
    };
  });
  const withSectorRank = Utils.parseBoolean(Utils.queryString(ctx.query("withSectorRank")));
  if (!withSectorRank) {
    const { data: data2 } = Utils.applyPagination(withFlags, offset, limit);
    return ctx.send.json(data2);
  }
  const bySector = /* @__PURE__ */ new Map();
  for (const row of withFlags) {
    Utils.pushToMapList(bySector, row.sector ?? "", row);
  }
  const rowsWithSectorRank = [];
  for (const sectorRows of bySector.values()) {
    sectorRows.sort((a, b2) => b2.compositeScore - a.compositeScore);
    const sectorCount = sectorRows.length;
    sectorRows.forEach((row, index2) => {
      const sectorRank = index2 + 1;
      const sectorPercentile = Utils.sectorPercentile(sectorRank, sectorCount);
      rowsWithSectorRank.push({
        ...row,
        sectorRank,
        sectorPercentile
      });
    });
  }
  rowsWithSectorRank.sort((a, b2) => b2.compositeScore - a.compositeScore);
  const { data } = Utils.applyPagination(rowsWithSectorRank, offset, limit);
  return ctx.send.json(data);
}
var init_ranked = __esm({
  "src/server/routes/api/screener/ranked.ts"() {
    init_Database();
    init_Utils();
    init_schemas();
    init_services();
  }
});

// src/server/routes/api/screener/rsi.ts
async function GET5(ctx) {
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query("date")));
  const periodRaw = Utils.parseNumber(Utils.queryString(ctx.query("period")));
  const period = periodRaw != null && periodRaw >= 1 && periodRaw <= 100 ? periodRaw : RSI.defaultPeriod;
  let dateRef = dateParsed ?? CronDate.todayDateInt();
  const latestRows = await Database_default.select({ date: summary.date }).from(summary).orderBy(desc(summary.date)).limit(1);
  const latestDate = latestRows[0]?.date;
  if (latestDate != null && Number.isFinite(latestDate)) {
    const maxDate = Number(latestDate);
    if (dateRef > maxDate) {
      dateRef = maxDate;
    }
  }
  const dateStart = Utils.addDaysToDateInt(dateRef, -60);
  const summaryRows = await Database_default.select({
    stockCode: summary.stockCode,
    date: summary.date,
    priceClose: summary.priceClose
  }).from(summary).where(and(gte(summary.date, dateStart), lte(summary.date, dateRef))).orderBy(asc(summary.stockCode), desc(summary.date));
  const closesByCode = /* @__PURE__ */ new Map();
  for (const row of summaryRows) {
    const close = row.priceClose != null && Number.isFinite(Number(row.priceClose)) ? Number(row.priceClose) : null;
    if (close === null) {
      continue;
    }
    const list = closesByCode.get(row.stockCode) ?? [];
    list.push({ date: Number(row.date), close });
    closesByCode.set(row.stockCode, list);
  }
  const codeToLastRsi = /* @__PURE__ */ new Map();
  const take = period + 20;
  for (const [stockCode, rows] of closesByCode.entries()) {
    const sorted = [...rows].sort((a, b2) => b2.date - a.date).slice(0, take);
    const closes = sorted.reverse().map((r) => r.close);
    if (closes.length < period + 1) {
      codeToLastRsi.set(stockCode, null);
      continue;
    }
    const rsiValues = RSI.calculate(closes, period);
    const lastRsi = rsiValues[rsiValues.length - 1] ?? null;
    codeToLastRsi.set(stockCode, lastRsi);
  }
  const screenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    sector: screener.sector
  }).from(screener);
  const items = screenerRows.map((row) => ({
    code: row.code,
    name: row.name ?? null,
    sector: row.sector ?? null,
    rsi: codeToLastRsi.get(row.code) ?? null
  }));
  const bySector = {};
  for (const row of items) {
    const key = row.sector != null && row.sector.trim() !== "" ? row.sector.trim() : "";
    if (!bySector[key]) {
      bySector[key] = [];
    }
    bySector[key].push(row);
  }
  const response = {
    date: dateRef,
    period,
    data: { byCode: items, bySector }
  };
  return ctx.send.json(response);
}
var init_rsi = __esm({
  "src/server/routes/api/screener/rsi.ts"() {
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_RSI();
    init_schemas();
    init_services();
  }
});

// src/server/routes/api/screener/bid-offer.ts
async function GET6(ctx) {
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query("date")));
  let dateRef = dateParsed ?? CronDate.todayDateInt();
  const latestRows = await Database_default.select({ date: summary.date }).from(summary).orderBy(desc(summary.date)).limit(1);
  const latestDate = latestRows[0]?.date;
  if (latestDate != null && Number.isFinite(latestDate)) {
    const maxDate = Number(latestDate);
    if (dateRef > maxDate) {
      dateRef = maxDate;
    }
  }
  const summaryRows = await Database_default.select({
    stockCode: summary.stockCode,
    bidVolume: summary.bidVolume,
    offerVolume: summary.offerVolume
  }).from(summary).where(eq(summary.date, dateRef));
  const screenerRows = await Database_default.select({
    code: screener.code,
    sector: screener.sector
  }).from(screener);
  const codeToSector = /* @__PURE__ */ new Map();
  for (const row of screenerRows) {
    const sector = row.sector != null && row.sector.trim() !== "" ? row.sector.trim() : "(Tanpa sektor)";
    codeToSector.set(row.code, sector);
  }
  const bySector = /* @__PURE__ */ new Map();
  for (const row of summaryRows) {
    const sector = codeToSector.get(row.stockCode) ?? "(Tanpa sektor)";
    const bid = row.bidVolume != null && Number.isFinite(Number(row.bidVolume)) ? Number(row.bidVolume) : 0;
    const offer = row.offerVolume != null && Number.isFinite(Number(row.offerVolume)) ? Number(row.offerVolume) : 0;
    const cur = bySector.get(sector);
    if (cur) {
      cur.bidVolume += bid;
      cur.offerVolume += offer;
      cur.count += 1;
    } else {
      bySector.set(sector, { bidVolume: bid, offerVolume: offer, count: 1 });
    }
  }
  const data = Array.from(bySector.entries()).map(([sector, agg]) => ({
    sector,
    bidVolume: agg.bidVolume,
    offerVolume: agg.offerVolume,
    count: agg.count
  })).sort((a, b2) => b2.bidVolume + b2.offerVolume - (a.bidVolume + a.offerVolume));
  const response = { date: dateRef, data };
  return ctx.send.json(response);
}
var init_bid_offer = __esm({
  "src/server/routes/api/screener/bid-offer.ts"() {
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
    init_services();
  }
});

// src/server/routes/api/sector/strength.ts
async function GET7(ctx) {
  const week = Utils.parseWeek(Utils.queryString(ctx.query("week")));
  const source = Utils.queryString(ctx.query("source"));
  const useOhlc = source === "ohlc";
  if (useOhlc) {
    const maxDateRows = await Database_default.select({
      date: summary.date
    }).from(summary).orderBy(desc(summary.date)).limit(1);
    const endDate = maxDateRows[0]?.date;
    if (endDate == null || !Number.isFinite(endDate)) {
      return ctx.send.json([]);
    }
    const startDate = Utils.addDaysToDateInt(Number(endDate), -week * 7);
    const summaryRows = await Database_default.select({
      stockCode: summary.stockCode,
      date: summary.date,
      priceClose: summary.priceClose
    }).from(summary).where(and(gte(summary.date, startDate), lte(summary.date, Number(endDate)))).orderBy(asc(summary.stockCode), asc(summary.date));
    const codeToRows = /* @__PURE__ */ new Map();
    for (const row of summaryRows) {
      Utils.pushToMapList(codeToRows, row.stockCode, {
        date: Number(row.date),
        close: row.priceClose != null ? Number(row.priceClose) : null
      });
    }
    const codeToReturnPc = /* @__PURE__ */ new Map();
    for (const [code, rows] of codeToRows.entries()) {
      const rowsByDate = [...rows].sort((a, b2) => a.date - b2.date);
      const firstClose = rowsByDate[0]?.close;
      const lastClose = rowsByDate[rowsByDate.length - 1]?.close;
      if (firstClose != null && lastClose != null) {
        const returnPct = Utils.returnPctFromPrices(firstClose, lastClose);
        if (returnPct != null) {
          codeToReturnPc.set(code, returnPct);
        }
      }
    }
    const screenerRowsForSector = await Database_default.select({
      code: screener.code,
      sector: screener.sector
    }).from(screener);
    const codeToSector = /* @__PURE__ */ new Map();
    for (const row of screenerRowsForSector) {
      if (Utils.isNonEmptyString(row.sector)) {
        codeToSector.set(row.code, row.sector.trim());
      }
    }
    const allSectorsOhlc = Utils.uniqueSorted(screenerRowsForSector.map((row) => row.sector));
    const bySector2 = /* @__PURE__ */ new Map();
    for (const [code, returnPc] of codeToReturnPc.entries()) {
      const sector = codeToSector.get(code);
      if (sector == null) {
        continue;
      }
      Utils.pushToMapList(bySector2, sector, returnPc);
    }
    const sectorStrengthRows2 = [];
    for (const sector of allSectorsOhlc) {
      const momentumValues = bySector2.get(sector) ?? [];
      const sum = momentumValues.reduce((acc, momentumPct) => acc + momentumPct, 0);
      const avgMomentum = momentumValues.length > 0 ? sum / momentumValues.length : 0;
      sectorStrengthRows2.push({
        sector,
        avgMomentum: Utils.round3(avgMomentum),
        count: momentumValues.length,
        rank: 0
      });
    }
    sectorStrengthRows2.sort((a, b2) => b2.avgMomentum - a.avgMomentum);
    sectorStrengthRows2.forEach((strengthRow, index2) => {
      strengthRow.rank = index2 + 1;
    });
    return ctx.send.json(sectorStrengthRows2);
  }
  const screenerRows = await Database_default.select({
    sector: screener.sector,
    week4PC: screener.week4PC,
    week13PC: screener.week13PC,
    week26PC: screener.week26PC,
    week52PC: screener.week52PC
  }).from(screener);
  const allSectors = Utils.uniqueSorted(screenerRows.map((row) => row.sector));
  const bySector = /* @__PURE__ */ new Map();
  for (const row of screenerRows) {
    if (!Utils.isNonEmptyString(row.sector)) {
      continue;
    }
    let momentumValue = null;
    if (week === 1) {
      momentumValue = row.week4PC ?? null;
    } else if (week === 4) {
      momentumValue = row.week4PC ?? null;
    } else if (week === 13) {
      momentumValue = row.week13PC ?? null;
    } else if (week === 26) {
      momentumValue = row.week26PC;
    }
    if (momentumValue == null || !Number.isFinite(momentumValue)) {
      continue;
    }
    const sector = row.sector.trim();
    Utils.pushToMapList(bySector, sector, momentumValue);
  }
  const sectorStrengthRows = [];
  for (const sector of allSectors) {
    const momentumValues = bySector.get(sector) ?? [];
    const sum = momentumValues.reduce((acc, momentumPct) => acc + momentumPct, 0);
    const avgMomentum = momentumValues.length > 0 ? sum / momentumValues.length : 0;
    sectorStrengthRows.push({
      sector,
      avgMomentum: Utils.round3(avgMomentum),
      count: momentumValues.length,
      rank: 0
    });
  }
  sectorStrengthRows.sort((a, b2) => b2.avgMomentum - a.avgMomentum);
  sectorStrengthRows.forEach((strengthRow, index2) => {
    strengthRow.rank = index2 + 1;
  });
  return ctx.send.json(sectorStrengthRows);
}
var init_strength = __esm({
  "src/server/routes/api/sector/strength.ts"() {
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/routes/api/history/bid-offer.ts
async function GET8(ctx) {
  const startParsed = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const endParsed = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (startParsed === null || endParsed === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (endParsed < startParsed) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const maxDaysRaw = Utils.queryString(ctx.query("limit"));
  const maxDaysParsed = Utils.parseNumber(maxDaysRaw);
  const maxDays = maxDaysParsed != null && maxDaysParsed > 0 ? maxDaysParsed : 365;
  let start = startParsed;
  const end = endParsed;
  const spanDays = Math.floor(
    (Date.UTC(Math.floor(end / 1e4), Math.floor(end % 1e4 / 100) - 1, end % 100) - Date.UTC(Math.floor(start / 1e4), Math.floor(start % 1e4 / 100) - 1, start % 100)) / (1e3 * 60 * 60 * 24)
  );
  if (spanDays > maxDays) {
    start = Utils.addDaysToDateInt(end, -maxDays);
  }
  const summaryRows = await Database_default.select({
    date: summary.date,
    stockCode: summary.stockCode,
    bidVolume: summary.bidVolume,
    offerVolume: summary.offerVolume
  }).from(summary).where(and(gte(summary.date, start), lte(summary.date, end))).orderBy(asc(summary.date));
  if (summaryRows.length === 0) {
    const emptyResponse = {
      start,
      end,
      byDate: [],
      bySector: []
    };
    return ctx.send.json(emptyResponse);
  }
  const screenerRows = await Database_default.select({
    code: screener.code,
    sector: screener.sector
  }).from(screener);
  const codeToSector = /* @__PURE__ */ new Map();
  for (const row of screenerRows) {
    const sector = row.sector != null && row.sector.trim() !== "" ? row.sector.trim() : "(No sector)";
    codeToSector.set(row.code, sector);
  }
  const byDate = /* @__PURE__ */ new Map();
  const bySector = /* @__PURE__ */ new Map();
  for (const row of summaryRows) {
    const sector = codeToSector.get(row.stockCode) ?? "(No sector)";
    const bid = row.bidVolume != null && Number.isFinite(Number(row.bidVolume)) ? Number(row.bidVolume) : 0;
    const offer = row.offerVolume != null && Number.isFinite(Number(row.offerVolume)) ? Number(row.offerVolume) : 0;
    if (!byDate.has(row.date)) {
      byDate.set(row.date, /* @__PURE__ */ new Map());
    }
    const sectorMap = byDate.get(row.date);
    const currentAgg = sectorMap.get(sector) ?? { bidVolume: 0, offerVolume: 0, count: 0 };
    currentAgg.bidVolume += bid;
    currentAgg.offerVolume += offer;
    currentAgg.count += 1;
    sectorMap.set(sector, currentAgg);
    const sectorAgg = bySector.get(sector);
    if (sectorAgg) {
      sectorAgg.totalBid += bid;
      sectorAgg.totalOffer += offer;
      sectorAgg.dateSet.add(row.date);
    } else {
      bySector.set(sector, {
        totalBid: bid,
        totalOffer: offer,
        dateSet: /* @__PURE__ */ new Set([row.date])
      });
    }
  }
  const byDateEntries = Array.from(byDate.entries()).sort(([firstDate], [secondDate]) => firstDate - secondDate).map(([date2, sectorMap]) => {
    const sectors = {};
    for (const [sector, aggregate] of sectorMap.entries()) {
      sectors[sector] = aggregate;
    }
    return { date: date2, sectors };
  });
  const bySectorEntries = [];
  for (const [sector, agg] of bySector.entries()) {
    const dayCount = agg.dateSet.size;
    const avgBid = dayCount > 0 ? agg.totalBid / dayCount : 0;
    const avgOffer = dayCount > 0 ? agg.totalOffer / dayCount : 0;
    const ratio = agg.totalOffer > 0 ? agg.totalBid / agg.totalOffer : null;
    bySectorEntries.push({
      sector,
      totalBid: agg.totalBid,
      totalOffer: agg.totalOffer,
      dayCount,
      avgBid,
      avgOffer,
      ratio
    });
  }
  bySectorEntries.sort((first, second) => {
    const firstScore = first.totalBid + first.totalOffer;
    const secondScore = second.totalBid + second.totalOffer;
    return secondScore - firstScore;
  });
  const response = {
    start,
    end,
    byDate: byDateEntries,
    bySector: bySectorEntries
  };
  return ctx.send.json(response);
}
var init_bid_offer2 = __esm({
  "src/server/routes/api/history/bid-offer.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/routes/api/stock/[code]/detail.ts
async function GET9(ctx) {
  const code = ctx.param("code");
  if (!code || code.trim() === "") {
    throw ApiError.badRequest("INVALID_PARAM_CODE", "Missing or invalid code");
  }
  const stockCode = code.trim().toUpperCase();
  const start = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const end = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (start === null || end === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (end < start) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query("date")));
  const dateInt = dateParsed ?? CronDate.todayDateInt();
  const screenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    sector: screener.sector,
    industry: screener.industry,
    subSector: screener.subSector,
    per: screener.per,
    pbv: screener.pbv,
    roa: screener.roa,
    roe: screener.roe,
    der: screener.der,
    npm: screener.npm,
    marketCapital: screener.marketCapital,
    week4PC: screener.week4PC,
    week13PC: screener.week13PC,
    week26PC: screener.week26PC,
    week52PC: screener.week52PC,
    notation: screener.notation,
    corpAction: screener.corpAction,
    umaDate: screener.umaDate
  }).from(screener).where(eq(screener.code, stockCode));
  const screenerRow = screenerRows[0];
  if (screenerRow == null) {
    throw ApiError.notFound("STOCK_NOT_FOUND", "Stock not found");
  }
  const allScreenerRows = await Database_default.select({
    code: screener.code,
    name: screener.name,
    sector: screener.sector,
    per: screener.per,
    pbv: screener.pbv,
    roa: screener.roa,
    roe: screener.roe,
    der: screener.der,
    week4PC: screener.week4PC,
    week13PC: screener.week13PC,
    week26PC: screener.week26PC,
    week52PC: screener.week52PC
  }).from(screener);
  const rowsForScore = allScreenerRows.map((row) => ({
    code: row.code,
    name: row.name,
    sector: row.sector,
    per: row.per,
    pbv: row.pbv,
    roa: row.roa,
    roe: row.roe,
    der: row.der,
    week4PC: row.week4PC,
    week13PC: row.week13PC,
    week26PC: row.week26PC,
    week52PC: row.week52PC
  }));
  const rankedRows = Composite.computeRanked(rowsForScore);
  const rankedRow = rankedRows.find((rankedItem) => rankedItem.code === stockCode);
  const valueSummaryRows = await Database_default.select({
    value: summary.value,
    volume: summary.volume
  }).from(summary).where(and(eq(summary.stockCode, stockCode), eq(summary.date, dateInt)));
  const summaryRow = valueSummaryRows[0];
  const ohlcRows = await Database_default.select({
    date: summary.date,
    priceOpen: summary.priceOpen,
    priceHigh: summary.priceHigh,
    priceLow: summary.priceLow,
    priceClose: summary.priceClose,
    volume: summary.volume,
    change: summary.change
  }).from(summary).where(
    and(
      eq(summary.stockCode, stockCode),
      gte(summary.date, start),
      lte(summary.date, end)
    )
  ).orderBy(asc(summary.date));
  const hasNotation = Utils.isNonEmptyString(screenerRow.notation);
  const hasCorpAction = Utils.isNonEmptyString(screenerRow.corpAction);
  const hasUma = Utils.isNonEmptyString(screenerRow.umaDate);
  const detail = {
    code: screenerRow.code,
    name: screenerRow.name,
    sector: screenerRow.sector,
    industry: screenerRow.industry,
    subSector: screenerRow.subSector,
    per: screenerRow.per,
    pbv: screenerRow.pbv,
    roa: screenerRow.roa,
    roe: screenerRow.roe,
    der: screenerRow.der,
    npm: screenerRow.npm,
    marketCapital: screenerRow.marketCapital,
    week4PC: screenerRow.week4PC,
    week13PC: screenerRow.week13PC,
    week26PC: screenerRow.week26PC,
    week52PC: screenerRow.week52PC,
    hasNotation,
    hasCorpAction,
    hasUma,
    valueScore: rankedRow?.valueScore ?? 0,
    qualityScore: rankedRow?.qualityScore ?? 0,
    momentumScore: rankedRow?.momentumScore ?? 0,
    compositeScore: rankedRow?.compositeScore ?? 0,
    rank: rankedRow?.rank ?? 0,
    compositePercentile: rankedRow != null ? Utils.compositePercentile(rankedRow.rank - 1, rankedRows.length) : 0,
    rankedCount: rankedRows.length,
    value: summaryRow?.value ?? null,
    volume: summaryRow?.volume ?? null,
    ohlc: ohlcRows.map((row) => ({
      date: row.date,
      open: row.priceOpen,
      high: row.priceHigh,
      low: row.priceLow,
      close: row.priceClose,
      volume: row.volume,
      change: row.change
    }))
  };
  return ctx.send.json(detail);
}
var init_detail = __esm({
  "src/server/routes/api/stock/[code]/detail.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
    init_services();
  }
});

// src/server/routes/api/[code]/ohlc.ts
async function GET10(ctx) {
  const code = ctx.param("code");
  if (!code || code.trim() === "") {
    throw ApiError.badRequest("INVALID_PARAM_CODE", "Missing or invalid code");
  }
  const start = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const end = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (start === null || end === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (end < start) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const summaryRows = await Database_default.select({
    date: summary.date,
    open: summary.priceOpen,
    high: summary.priceHigh,
    low: summary.priceLow,
    close: summary.priceClose,
    volume: summary.volume,
    change: summary.change,
    bidVolume: summary.bidVolume,
    offerVolume: summary.offerVolume
  }).from(summary).where(
    and(
      eq(summary.stockCode, code.trim().toUpperCase()),
      gte(summary.date, start),
      lte(summary.date, end)
    )
  ).orderBy(asc(summary.date));
  const ohlcRows = summaryRows.map((row) => ({
    date: row.date,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
    change: row.change,
    bidVolume: row.bidVolume,
    offerVolume: row.offerVolume
  }));
  return ctx.send.json(ohlcRows);
}
var init_ohlc = __esm({
  "src/server/routes/api/[code]/ohlc.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/routes/api/[code]/rsi.ts
function buildRsiSeries(rowsWithClose, period) {
  const closes = rowsWithClose.map((r) => r.close);
  if (closes.length < period + 1) {
    return [];
  }
  const rsiValues = RSI.calculate(closes, period);
  const out = [];
  for (let i = period; i < rowsWithClose.length; i++) {
    const row = rowsWithClose[i];
    const rsi = rsiValues[i];
    if (row == null) {
      continue;
    }
    out.push({
      date: row.date,
      rsi: rsi != null && Number.isFinite(rsi) ? rsi : null
    });
  }
  return out;
}
async function GET11(ctx) {
  const code = ctx.param("code");
  if (!code || code.trim() === "") {
    throw ApiError.badRequest("INVALID_PARAM_CODE", "Missing or invalid code");
  }
  const start = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const end = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (start === null || end === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (end < start) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const period = RSI.defaultPeriod;
  const stockCode = code.trim().toUpperCase();
  const stockSummaryRows = await Database_default.select({
    date: summary.date,
    priceClose: summary.priceClose
  }).from(summary).where(
    and(
      eq(summary.stockCode, stockCode),
      gte(summary.date, start),
      lte(summary.date, end)
    )
  ).orderBy(asc(summary.date));
  const rowsWithClose = [];
  for (const row of stockSummaryRows) {
    const c = row.priceClose != null && Number.isFinite(Number(row.priceClose)) ? Number(row.priceClose) : null;
    if (c !== null) {
      rowsWithClose.push({ date: Number(row.date), close: c });
    }
  }
  const data = buildRsiSeries(rowsWithClose, period);
  let sector = null;
  let sectorData = [];
  const screenerRow = await Database_default.select({ sector: screener.sector }).from(screener).where(eq(screener.code, stockCode)).limit(1);
  const sectorName = screenerRow[0]?.sector ?? null;
  if (sectorName != null && String(sectorName).trim() !== "") {
    sector = String(sectorName).trim();
    const sectorCodesRows = await Database_default.select({ code: screener.code }).from(screener).where(eq(screener.sector, sector));
    const sectorCodes = sectorCodesRows.map((r) => String(r.code).trim().toUpperCase());
    if (sectorCodes.length > 0) {
      const sectorSummaryRows = await Database_default.select({
        date: summary.date,
        stockCode: summary.stockCode,
        priceClose: summary.priceClose
      }).from(summary).where(
        and(
          inArray(summary.stockCode, sectorCodes),
          gte(summary.date, start),
          lte(summary.date, end)
        )
      ).orderBy(asc(summary.stockCode), asc(summary.date));
      const byCode = /* @__PURE__ */ new Map();
      for (const row of sectorSummaryRows) {
        const c = row.priceClose != null && Number.isFinite(Number(row.priceClose)) ? Number(row.priceClose) : null;
        if (c === null) {
          continue;
        }
        const sc = String(row.stockCode).trim().toUpperCase();
        const list = byCode.get(sc) ?? [];
        list.push({ date: Number(row.date), close: c });
        byCode.set(sc, list);
      }
      const rsiByDate = /* @__PURE__ */ new Map();
      for (const [, series] of byCode.entries()) {
        const sorted = [...series].sort((a, b2) => a.date - b2.date);
        const rsiSeries = buildRsiSeries(sorted, period);
        for (const point2 of rsiSeries) {
          if (point2.rsi != null && Number.isFinite(point2.rsi)) {
            const arr = rsiByDate.get(point2.date) ?? [];
            arr.push(point2.rsi);
            rsiByDate.set(point2.date, arr);
          }
        }
      }
      const dates = Array.from(rsiByDate.keys()).sort((a, b2) => a - b2);
      sectorData = dates.map((date2) => {
        const values2 = rsiByDate.get(date2) ?? [];
        const sum = values2.reduce((a, b2) => a + b2, 0);
        const avg = values2.length > 0 ? sum / values2.length : null;
        return { date: date2, rsi: avg };
      });
    }
  }
  const response = {
    code: stockCode,
    start,
    end,
    period,
    data,
    sector,
    sectorData
  };
  return ctx.send.json(response);
}
var init_rsi2 = __esm({
  "src/server/routes/api/[code]/rsi.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_RSI();
    init_schemas();
  }
});

// src/server/routes/api/[code]/foreign.ts
async function GET12(ctx) {
  const code = ctx.param("code");
  if (!code || code.trim() === "") {
    throw ApiError.badRequest("INVALID_PARAM_CODE", "Missing or invalid code");
  }
  const start = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const end = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (start === null || end === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (end < start) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const stockCode = code.trim().toUpperCase();
  const summaryRows = await Database_default.select({
    date: summary.date,
    foreignBuy: summary.foreignBuy,
    foreignSell: summary.foreignSell
  }).from(summary).where(
    and(
      eq(summary.stockCode, stockCode),
      gte(summary.date, start),
      lte(summary.date, end)
    )
  ).orderBy(asc(summary.date));
  const numOrZero = (v) => v != null && Number.isFinite(v) ? Number(v) : 0;
  const data = summaryRows.map((row) => {
    const buy = row.foreignBuy != null && Number.isFinite(Number(row.foreignBuy)) ? Number(row.foreignBuy) : null;
    const sell = row.foreignSell != null && Number.isFinite(Number(row.foreignSell)) ? Number(row.foreignSell) : null;
    const net2 = buy != null && sell != null ? buy - sell : null;
    return {
      date: Number(row.date),
      buy,
      sell,
      net: net2
    };
  });
  let totalBuy = 0;
  let totalSell = 0;
  for (const row of data) {
    totalBuy += numOrZero(row.buy);
    totalSell += numOrZero(row.sell);
  }
  const summary2 = {
    totalBuy,
    totalSell,
    totalNet: totalBuy - totalSell,
    dayCount: data.length
  };
  const response = {
    code: stockCode,
    start,
    end,
    data,
    summary: summary2
  };
  return ctx.send.json(response);
}
var init_foreign = __esm({
  "src/server/routes/api/[code]/foreign.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/routes/api/[code]/bid-offer.ts
async function GET13(ctx) {
  const code = ctx.param("code");
  if (!code || code.trim() === "") {
    throw ApiError.badRequest("INVALID_PARAM_CODE", "Missing or invalid code");
  }
  const start = Utils.parseDate(Utils.queryString(ctx.query("start")));
  const end = Utils.parseDate(Utils.queryString(ctx.query("end")));
  if (start === null || end === null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "start and end required (yyyymmdd, 8 digits)");
  }
  if (end < start) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "end must be >= start");
  }
  const summaryRows = await Database_default.select({
    date: summary.date,
    bidVolume: summary.bidVolume,
    offerVolume: summary.offerVolume
  }).from(summary).where(
    and(
      eq(summary.stockCode, code.trim().toUpperCase()),
      gte(summary.date, start),
      lte(summary.date, end)
    )
  ).orderBy(asc(summary.date));
  const rows = summaryRows.map((row) => ({
    date: row.date,
    bidVolume: row.bidVolume,
    offerVolume: row.offerVolume
  }));
  return ctx.send.json(rows);
}
var init_bid_offer3 = __esm({
  "src/server/routes/api/[code]/bid-offer.ts"() {
    init_errors();
    init_drizzle_orm();
    init_Database();
    init_Utils();
    init_schemas();
  }
});

// src/server/services/prediction/outcomeEvaluation.ts
function finite(value) {
  return value != null && Number.isFinite(value) ? value : null;
}
function evaluatePrediction(input, todayDateInt) {
  const windowEnd = input.createdDateInt + input.horizonDays;
  const windowBars = input.bars.filter((bar) => bar.dateInt >= input.createdDateInt && bar.dateInt <= windowEnd).sort((first, second) => first.dateInt - second.dateInt);
  let hitTarget = false;
  let hitStop = false;
  let mfe = null;
  let mae = null;
  for (const bar of windowBars) {
    const high = finite(bar.high);
    const low = finite(bar.low);
    if (high != null) {
      if (high >= input.targetPrice) {
        hitTarget = true;
      }
      const excursion = (high - input.entryPrice) / input.entryPrice * 100;
      mfe = mfe == null ? excursion : Math.max(mfe, excursion);
    }
    if (low != null) {
      if (low <= input.stopLoss) {
        hitStop = true;
      }
      const excursion = (low - input.entryPrice) / input.entryPrice * 100;
      mae = mae == null ? excursion : Math.min(mae, excursion);
    }
  }
  const base = {
    maxFavorableExcursion: mfe != null ? round2(mfe) : null,
    maxAdverseExcursion: mae != null ? round2(mae) : null,
    hitTarget: hitTarget ? "yes" : "no",
    hitStop: hitStop ? "yes" : "no"
  };
  if (todayDateInt <= windowEnd) {
    return { status: "open", referencePrice: null, returnPercent: null, ...base };
  }
  let firstTrigger = null;
  for (const bar of windowBars) {
    const low = finite(bar.low);
    const high = finite(bar.high);
    if (low != null && low <= input.stopLoss) {
      firstTrigger = "lost";
      break;
    }
    if (high != null && high >= input.targetPrice) {
      firstTrigger = "won";
      break;
    }
  }
  if (firstTrigger === "won") {
    const returnPercent = (input.targetPrice - input.entryPrice) / input.entryPrice * 100;
    return {
      status: "won",
      referencePrice: input.targetPrice,
      returnPercent: round2(returnPercent),
      ...base
    };
  }
  if (firstTrigger === "lost") {
    const returnPercent = (input.stopLoss - input.entryPrice) / input.entryPrice * 100;
    return {
      status: "lost",
      referencePrice: input.stopLoss,
      returnPercent: round2(returnPercent),
      ...base
    };
  }
  const lastWindowClose = [...windowBars].reverse().map((bar) => finite(bar.close)).find((close) => close != null);
  const lastAnyClose = [...input.bars].sort((first, second) => first.dateInt - second.dateInt).reverse().map((bar) => finite(bar.close)).find((close) => close != null);
  const referencePrice = lastWindowClose ?? lastAnyClose ?? null;
  return {
    status: "expired",
    referencePrice,
    returnPercent: referencePrice != null ? round2((referencePrice - input.entryPrice) / input.entryPrice * 100) : null,
    ...base
  };
}
var init_outcomeEvaluation = __esm({
  "src/server/services/prediction/outcomeEvaluation.ts"() {
    init_numbers();
  }
});

// src/server/jobs/OutcomeEvaluationJob.ts
async function stockBarsBetween(symbol, fromDateInt, toDateInt) {
  const rows = await Database_default.select({
    date: summary.date,
    priceHigh: summary.priceHigh,
    priceLow: summary.priceLow,
    priceClose: summary.priceClose
  }).from(summary).where(
    and(
      eq(summary.stockCode, symbol),
      gte(summary.date, fromDateInt),
      lte(summary.date, toDateInt)
    )
  ).orderBy(asc(summary.date));
  return rows.map((row) => ({
    dateInt: row.date,
    high: row.priceHigh,
    low: row.priceLow,
    close: row.priceClose
  }));
}
async function settleOne(prediction) {
  const createdDateInt = CronDate.jakartaDateIntFromDate(new Date(prediction.createdAt));
  const windowEnd = createdDateInt + prediction.horizonDays;
  const bars = prediction.assetClass === "stock" ? await stockBarsBetween(prediction.symbol, createdDateInt, windowEnd) : await InstrumentService.barsBetween(prediction.symbol, createdDateInt, windowEnd);
  const result = evaluatePrediction(
    {
      createdDateInt,
      horizonDays: prediction.horizonDays,
      entryPrice: prediction.entryPrice,
      targetPrice: prediction.targetPrice,
      stopLoss: prediction.stopLoss,
      bars
    },
    CronDate.todayDateInt()
  );
  if (result.status === "open") {
    return false;
  }
  await Database_default.transaction(async (tx) => {
    await tx.insert(predictionOutcomes).values({
      predictionId: prediction.id,
      referencePrice: result.referencePrice ?? 0,
      returnPercent: result.returnPercent ?? 0,
      maxFavorableExcursion: result.maxFavorableExcursion,
      maxAdverseExcursion: result.maxAdverseExcursion,
      hitTarget: result.hitTarget,
      hitStop: result.hitStop
    });
    await tx.update(predictions).set({ status: result.status }).where(eq(predictions.id, prediction.id));
  });
  return true;
}
var SETTLE_MIN_AGE_MS, INTRADAY_SETTLE_MIN_AGE_MS, inFlight, OutcomeEvaluationJob;
var init_OutcomeEvaluationJob = __esm({
  "src/server/jobs/OutcomeEvaluationJob.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_Date();
    init_InstrumentService();
    init_outcomeEvaluation();
    SETTLE_MIN_AGE_MS = 24 * 60 * 60 * 1e3;
    INTRADAY_SETTLE_MIN_AGE_MS = 60 * 60 * 1e3;
    inFlight = null;
    OutcomeEvaluationJob = class _OutcomeEvaluationJob {
      /** Settles open predictions older than a day, up to `limit`. Returns the settled count. */
      static run(limit = 200) {
        if (inFlight != null) {
          return inFlight;
        }
        inFlight = _OutcomeEvaluationJob.runInternal(limit).finally(() => {
          inFlight = null;
        });
        return inFlight;
      }
      static async runInternal(limit) {
        const now = /* @__PURE__ */ new Date();
        const dailyThreshold = new Date(now.getTime() - SETTLE_MIN_AGE_MS);
        const intradayThreshold = new Date(now.getTime() - INTRADAY_SETTLE_MIN_AGE_MS);
        const candidates = await Database_default.select().from(predictions).where(
          and(
            eq(predictions.status, "open"),
            lt(predictions.createdAt, dailyThreshold)
          )
        ).orderBy(asc(predictions.createdAt)).limit(Math.min(Math.max(limit, 1), 500));
        const intradayCandidates = await Database_default.select().from(predictions).where(
          and(
            eq(predictions.status, "open"),
            lt(predictions.createdAt, intradayThreshold)
          )
        ).orderBy(asc(predictions.createdAt)).limit(Math.min(Math.max(limit, 1), 500));
        const allCandidates = [...candidates];
        for (const pred of intradayCandidates) {
          if (!allCandidates.some((c) => c.id === pred.id)) {
            allCandidates.push(pred);
          }
        }
        allCandidates.sort((a, b2) => a.createdAt.getTime() - b2.createdAt.getTime());
        let settled = 0;
        for (const prediction of allCandidates) {
          try {
            if (await settleOne(prediction)) {
              settled++;
            }
          } catch (error) {
            console.error(`[evaluation] failed to settle ${prediction.symbol}:`, error);
          }
        }
        if (settled > 0) {
          console.info(`[evaluation] settled ${settled} prediction(s)`);
        }
        return settled;
      }
    };
  }
});

// src/server/routes/api/predictions.ts
function validateOptionalEnum(raw, values2, param) {
  if (raw === void 0 || raw === "") {
    return void 0;
  }
  if (!values2.includes(raw)) {
    throw ApiError.badRequest(
      `INVALID_PARAM_${param.toUpperCase()}`,
      `${param} must be one of: ${values2.join(", ")} (got "${raw}")`
    );
  }
  return raw;
}
function jakartaDayStartUtcMs(dateInt) {
  const year = Math.floor(dateInt / 1e4);
  const month = Math.floor(dateInt % 1e4 / 100);
  const day = dateInt % 100;
  return Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1e3;
}
async function GET14(ctx) {
  const symbol = ctx.query("symbol")?.trim().toUpperCase() || void 0;
  const assetClass = validateOptionalEnum(ctx.query("assetClass"), VALID_ASSET_CLASSES, "assetClass");
  const strategy = validateOptionalEnum(ctx.query("strategy"), VALID_STRATEGIES, "strategy");
  const status = validateOptionalEnum(ctx.query("status"), VALID_STATUSES, "status");
  const dateFromRaw = ctx.query("dateFrom");
  const dateToRaw = ctx.query("dateTo");
  const dateFrom = dateFromRaw != null && dateFromRaw !== "" ? Utils.parseDate(dateFromRaw) : null;
  const dateTo = dateToRaw != null && dateToRaw !== "" ? Utils.parseDate(dateToRaw) : null;
  if (dateFromRaw != null && dateFromRaw !== "" && dateFrom == null || dateToRaw != null && dateToRaw !== "" && dateTo == null) {
    throw ApiError.badRequest("INVALID_PARAM_DATE", "dateFrom/dateTo must be yyyymmdd (8 digits)");
  }
  const limitRaw = ctx.query("limit");
  const offsetRaw = ctx.query("offset");
  const { limit, offset } = Utils.parseLimitOffset(limitRaw, offsetRaw, 20, 200);
  await OutcomeEvaluationJob.run();
  const conditions = [];
  if (symbol !== void 0) {
    conditions.push(eq(predictions.symbol, symbol));
  }
  if (assetClass !== void 0) {
    conditions.push(eq(predictions.assetClass, assetClass));
  }
  if (strategy !== void 0) {
    conditions.push(eq(predictions.strategy, strategy));
  }
  if (status !== void 0) {
    conditions.push(eq(predictions.status, status));
  }
  if (dateFrom != null) {
    conditions.push(gte(predictions.createdAt, new Date(jakartaDayStartUtcMs(dateFrom))));
  }
  if (dateTo != null) {
    conditions.push(lt(predictions.createdAt, new Date(jakartaDayStartUtcMs(dateTo) + 864e5)));
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const rows = await Database_default.select().from(predictions).where(where).orderBy(desc(predictions.createdAt)).limit(limit).offset(offset);
  const totalCountRows = await Database_default.select({ total: count() }).from(predictions).where(where);
  const totalCount = totalCountRows[0]?.total ?? 0;
  const ids = rows.map((row) => row.id);
  const outcomes = ids.length > 0 ? await Database_default.select().from(predictionOutcomes).where(inArray(predictionOutcomes.predictionId, ids)) : [];
  const outcomeByPredictionId = new Map(
    outcomes.map((outcome) => [outcome.predictionId, outcome])
  );
  ctx.send.json({
    data: rows.map((row) => ({
      ...row,
      outcome: outcomeByPredictionId.get(row.id) ?? null
    })),
    meta: { totalCount, limit, offset }
  });
}
async function POST(ctx) {
  const body = ctx.body ?? {};
  const prediction = await Prediction.create({
    symbol: String(body.symbol ?? ""),
    assetClass: body.assetClass,
    strategy: body.strategy,
    currentPrice: body.currentPrice != null && body.currentPrice !== "" ? Number(body.currentPrice) : void 0,
    useDeepSeek: body.useDeepSeek === true,
    aiProvider: body.aiProvider
  });
  ctx.send.json({ data: prediction }, { status: 201 });
}
var VALID_STRATEGIES, VALID_ASSET_CLASSES, VALID_STATUSES;
var init_predictions = __esm({
  "src/server/routes/api/predictions.ts"() {
    init_drizzle_orm();
    init_Database();
    init_schemas();
    init_errors();
    init_OutcomeEvaluationJob();
    init_Prediction2();
    init_Utils();
    VALID_STRATEGIES = ["scalping", "swing", "long_term"];
    VALID_ASSET_CLASSES = ["stock", "forex", "metal"];
    VALID_STATUSES = ["open", "won", "lost", "expired"];
  }
});

// src/server/routes/api/predictions/stats.ts
function round4(value) {
  return Math.round(value * 1e4) / 1e4;
}
function meanOrNull(values2) {
  if (values2.length === 0) {
    return null;
  }
  return round4(values2.reduce((sum, value) => sum + value, 0) / values2.length);
}
async function GET15(ctx) {
  await OutcomeEvaluationJob.run();
  const predictions2 = await Database_default.select({
    id: predictions.id,
    strategy: predictions.strategy,
    assetClass: predictions.assetClass,
    status: predictions.status,
    bullishProbability: predictions.bullishProbability
  }).from(predictions);
  const outcomes = await Database_default.select({
    predictionId: predictionOutcomes.predictionId,
    returnPercent: predictionOutcomes.returnPercent,
    maxAdverseExcursion: predictionOutcomes.maxAdverseExcursion
  }).from(predictionOutcomes);
  const outcomeByPredictionId = new Map(
    outcomes.map((outcome) => [outcome.predictionId, outcome])
  );
  const counts = { total: predictions2.length, open: 0, won: 0, lost: 0, expired: 0 };
  const settled = predictions2.filter((prediction) => {
    if (prediction.status === "open") {
      counts.open++;
      return false;
    }
    counts[prediction.status]++;
    return outcomeByPredictionId.has(prediction.id);
  });
  const settledReturns = [];
  const settledDrawdowns = [];
  const byStrategy = /* @__PURE__ */ new Map();
  const byAssetClass = /* @__PURE__ */ new Map();
  const buckets = /* @__PURE__ */ new Map();
  for (const prediction of settled) {
    const outcome = outcomeByPredictionId.get(prediction.id);
    if (outcome == null) {
      continue;
    }
    settledReturns.push(outcome.returnPercent);
    if (outcome.maxAdverseExcursion != null) {
      settledDrawdowns.push(Math.abs(outcome.maxAdverseExcursion));
    }
    for (const [map, key] of [
      [byStrategy, prediction.strategy],
      [byAssetClass, prediction.assetClass]
    ]) {
      const entry = map.get(key) ?? { returns: [], drawdowns: [], wonLost: { won: 0, lost: 0 } };
      entry.returns.push(outcome.returnPercent);
      if (outcome.maxAdverseExcursion != null) {
        entry.drawdowns.push(Math.abs(outcome.maxAdverseExcursion));
      }
      if (prediction.status === "won") {
        entry.wonLost.won++;
      } else if (prediction.status === "lost") {
        entry.wonLost.lost++;
      }
      map.set(key, entry);
    }
    if (prediction.status === "won" || prediction.status === "lost") {
      const bucketIndex = Math.min(Math.floor(prediction.bullishProbability / 10), 9);
      const bucket = buckets.get(bucketIndex) ?? { won: 0, lost: 0 };
      if (prediction.status === "won") {
        bucket.won++;
      } else {
        bucket.lost++;
      }
      buckets.set(bucketIndex, bucket);
    }
  }
  const decidedCount = counts.won + counts.lost;
  const winRate = decidedCount > 0 ? round4(counts.won / decidedCount) : null;
  const overall = {
    winRate,
    avgReturn: meanOrNull(settledReturns),
    avgDrawdown: meanOrNull(settledDrawdowns),
    settledCount: settled.length
  };
  const strategyStats = [];
  for (const strategy of ["scalping", "swing", "long_term"]) {
    const entry = byStrategy.get(strategy);
    const strategyCount = predictions2.filter((prediction) => prediction.strategy === strategy).length;
    if (entry == null) {
      if (strategyCount > 0) {
        strategyStats.push({
          strategy,
          count: strategyCount,
          settledCount: 0,
          winRate: null,
          avgReturn: null,
          avgDrawdown: null
        });
      }
      continue;
    }
    const decided = entry.wonLost.won + entry.wonLost.lost;
    strategyStats.push({
      strategy,
      count: strategyCount,
      settledCount: entry.returns.length,
      winRate: decided > 0 ? round4(entry.wonLost.won / decided) : null,
      avgReturn: meanOrNull(entry.returns),
      avgDrawdown: meanOrNull(entry.drawdowns)
    });
  }
  const assetClassStats = [];
  for (const assetClass of ["stock", "forex", "metal"]) {
    const entry = byAssetClass.get(assetClass);
    const assetCount = predictions2.filter((prediction) => prediction.assetClass === assetClass).length;
    if (entry == null) {
      if (assetCount > 0) {
        assetClassStats.push({
          assetClass,
          count: assetCount,
          settledCount: 0,
          winRate: null,
          avgReturn: null,
          avgDrawdown: null
        });
      }
      continue;
    }
    const decided = entry.wonLost.won + entry.wonLost.lost;
    assetClassStats.push({
      assetClass,
      count: assetCount,
      settledCount: entry.returns.length,
      winRate: decided > 0 ? round4(entry.wonLost.won / decided) : null,
      avgReturn: meanOrNull(entry.returns),
      avgDrawdown: meanOrNull(entry.drawdowns)
    });
  }
  const calibration = [];
  for (const [bucketIndex, bucket] of [...buckets.entries()].sort((a, b2) => a[0] - b2[0])) {
    const decided = bucket.won + bucket.lost;
    calibration.push({
      bucket: `${bucketIndex * 10}-${bucketIndex * 10 + 9}`,
      count: decided,
      winRate: decided > 0 ? round4(bucket.won / decided) : null
    });
  }
  ctx.send.json({
    data: {
      counts,
      overall,
      byStrategy: strategyStats,
      byAssetClass: assetClassStats,
      calibration
    }
  });
}
var init_stats = __esm({
  "src/server/routes/api/predictions/stats.ts"() {
    init_Database();
    init_schemas();
    init_OutcomeEvaluationJob();
  }
});

// src/server/routes/api/instruments.ts
async function GET16(ctx) {
  const items = await InstrumentService.list();
  await Promise.allSettled(
    items.map((item) => InstrumentService.ensureFresh(item.symbol))
  );
  const refreshed = await InstrumentService.list();
  const yesterday = CronDate.getDateIntForDayOffset(-1);
  const stale = refreshed.some(
    (item) => item.latestDateInt == null || item.latestDateInt < yesterday
  );
  ctx.send.json({ data: refreshed, stale });
}
var init_instruments = __esm({
  "src/server/routes/api/instruments.ts"() {
    init_Date();
    init_InstrumentService();
  }
});

// src/server/routes/api/instruments/[symbol]/ohlc.ts
function parseDays(raw) {
  if (raw === void 0 || raw === "") {
    return 90;
  }
  const days = Number(raw);
  if (!Number.isFinite(days) || days < 1) {
    throw ApiError.badRequest("INVALID_PARAM_DAYS", "days must be a positive integer");
  }
  return Math.min(Math.floor(days), 365);
}
async function GET17(ctx) {
  const symbol = (ctx.param("symbol") ?? "").toUpperCase();
  if (symbol === "") {
    throw ApiError.badRequest("INVALID_PARAM_SYMBOL", "symbol is required");
  }
  const days = parseDays(ctx.query("days"));
  await InstrumentService.ensureFresh(symbol);
  const bars = await InstrumentService.latestBars(symbol, days);
  ctx.send.json({
    data: {
      symbol,
      dateInt: bars.map((bar) => bar.dateInt),
      priceOpen: bars.map((bar) => bar.open),
      priceHigh: bars.map((bar) => bar.high),
      priceLow: bars.map((bar) => bar.low),
      priceClose: bars.map((bar) => bar.close),
      volume: bars.map((bar) => bar.volume)
    }
  });
}
var init_ohlc2 = __esm({
  "src/server/routes/api/instruments/[symbol]/ohlc.ts"() {
    init_errors();
    init_InstrumentService();
  }
});

// src/server/routes/api/analyses.ts
async function parseBody(body) {
  const record = body ?? {};
  const symbol = normalizeSymbol(String(record.symbol ?? ""));
  if (symbol === "") {
    throw ApiError.badRequest("ANALYSIS_INPUT_ERROR", "symbol is required");
  }
  const strategy = parseStrategy(
    record.strategy != null && record.strategy !== "" ? String(record.strategy) : void 0
  );
  const assetClass = parseAssetClass(
    record.assetClass != null && record.assetClass !== "" ? String(record.assetClass) : void 0,
    symbol
  );
  if (assetClass !== "stock" && !await InstrumentService.isKnown(symbol)) {
    throw ApiError.badRequest(
      "UNKNOWN_INSTRUMENT",
      `unknown instrument "${symbol}". Supported forex/metals: ${SUPPORTED_FOREX_METALS.join(", ")}`
    );
  }
  return { symbol, assetClass, strategy };
}
async function POST2(ctx) {
  const body = ctx.body ?? {};
  const { symbol, assetClass, strategy } = await parseBody(body);
  const currentPrice = body.currentPrice != null && body.currentPrice !== "" ? Number(body.currentPrice) : void 0;
  const provider = body.aiProvider ?? "opencode";
  const assembled = await assembleRuleInput(symbol, assetClass, strategy, currentPrice);
  const rulePrediction = computeRulePrediction(assembled.ruleInput);
  const analyzeInput = {
    symbol,
    assetClass,
    strategy,
    entryPrice: assembled.ruleInput.entryPrice,
    ruleOutput: rulePrediction,
    closes: assembled.closes,
    fundamentals: assembled.ruleInput.fundamentals,
    indicators: assembled.ruleInput.indicators
  };
  const result = provider === "opencode" ? await OpenCode.analyze(analyzeInput) : await DeepSeek.analyze(analyzeInput);
  ctx.send.json({
    data: {
      runId: result.runId,
      symbol,
      assetClass,
      strategy,
      promptVersion: result.promptVersion,
      model: result.model,
      status: result.status,
      rulePrediction: {
        entryPrice: rulePrediction.entryPrice,
        targetPrice: rulePrediction.targetPrice,
        stopLoss: rulePrediction.stopLoss,
        bullishProbability: rulePrediction.bullishProbability,
        confidenceScore: rulePrediction.confidenceScore,
        ruleScore: rulePrediction.ruleScore,
        horizonDays: rulePrediction.horizonDays,
        riskNotes: rulePrediction.riskNotes,
        metadata: rulePrediction.metadata
      },
      aiResult: result.parsed,
      aiSummary: result.summary,
      errorMessage: result.errorMessage,
      tokens: result.tokens,
      estimatedCostUsd: result.estimatedCostUsd
    }
  });
}
async function GET18(ctx) {
  const symbol = ctx.query("symbol");
  const assetClass = ctx.query("assetClass");
  const provider = ctx.query("provider");
  const limitRaw = ctx.query("limit");
  const limit = limitRaw !== void 0 && limitRaw !== "" ? Number(limitRaw) : 20;
  const runs = provider === "opencode" ? await OpenCode.recentRuns({
    symbol: symbol != null ? symbol.trim().toUpperCase() : void 0,
    assetClass: assetClass ?? void 0,
    limit: Number.isFinite(limit) ? limit : 20
  }) : await DeepSeek.recentRuns({
    symbol: symbol != null ? symbol.trim().toUpperCase() : void 0,
    assetClass: assetClass ?? void 0,
    limit: Number.isFinite(limit) ? limit : 20
  });
  ctx.send.json({ data: runs });
}
var init_analyses = __esm({
  "src/server/routes/api/analyses.ts"() {
    init_DeepSeek();
    init_OpenCode();
    init_InstrumentService();
    init_Prediction2();
    init_inputs();
    init_rules();
    init_errors();
  }
});

// src/server/routes/api/ingest.ts
async function POST3(ctx) {
  console.info("[ingest-api] manual ingestion triggered");
  try {
    const client2 = new Client();
    try {
      await Screener.run(client2);
    } catch (error) {
      console.error("[ingest-api] screener failed (non-blocking):", error);
    }
    const today = CronDate.todayDateInt();
    try {
      await Summary.run(client2, today);
    } catch (error) {
      console.error(`[ingest-api] summary failed for ${today}:`, error);
    }
    clearMarketDataCache();
    try {
      const settled = await OutcomeEvaluationJob.run();
      if (settled > 0) {
        console.info(`[ingest-api] settled ${settled} prediction(s)`);
      }
    } catch (error) {
      console.error("[ingest-api] outcome evaluation failed (non-blocking):", error);
    }
    console.info("[ingest-api] done");
    return ctx.send.json({ ok: true, summaryDate: today });
  } catch (error) {
    console.error("[ingest-api] ingestion failed:", error);
    return ctx.send.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
var init_ingest = __esm({
  "src/server/routes/api/ingest.ts"() {
    init_services();
    init_StockMarketDataRepository();
    init_OutcomeEvaluationJob();
  }
});

// src/server/routes/api/debug.ts
async function GET19(ctx) {
  const screenerCount = await Database_default.select({ count: screener.code }).from(screener);
  const summaryDates = await Database_default.select({ date: summary.date }).from(summary).groupBy(summary.date);
  const summaryCount = await Database_default.select({ count: summary.stockCode }).from(summary);
  const latestDate = summaryDates.length > 0 ? summaryDates.sort((a, b2) => (b2.date ?? 0) - (a.date ?? 0))[0]?.date ?? null : null;
  let bundleInfo = {};
  if (latestDate != null) {
    try {
      const bundle = await loadMarketData(latestDate);
      bundleInfo = {
        summaryDate: bundle.summaryDate,
        screenerRows: bundle.screenerRows.length,
        codesWithLiquidity: bundle.codeToLiquidity.size,
        codesWithTechnical: bundle.codeToTechnical.size,
        sampleScreenerRows: bundle.screenerRows.slice(0, 3).map((r) => ({
          code: r.code,
          name: r.name,
          per: r.per,
          roe: r.roe,
          der: r.der,
          week13PC: r.week13PC
        }))
      };
    } catch (error) {
      bundleInfo = { error: String(error) };
    }
  }
  return ctx.send.json({
    screenerRows: screenerCount.length,
    summaryDates: summaryDates.length,
    summaryRows: summaryCount.length,
    latestSummaryDate: latestDate,
    bundle: bundleInfo
  });
}
var init_debug = __esm({
  "src/server/routes/api/debug.ts"() {
    init_Database();
    init_schemas();
    init_StockMarketDataRepository();
  }
});

// src/server/app.ts
var app_exports = {};
__export(app_exports, {
  createApp: () => createApp
});
import crypto3 from "node:crypto";
import express from "express";
function mountRoute(app2, routePath, handlers) {
  const wrap = (handler2) => {
    return async (req, res, next) => {
      try {
        await handler2(createExpressContext(req, res));
      } catch (error) {
        next(error);
      }
    };
  };
  if (handlers.GET != null) {
    app2.get(routePath, wrap(handlers.GET));
  }
  if (handlers.POST != null) {
    app2.post(routePath, wrap(handlers.POST));
  }
}
function createApp() {
  const app2 = express();
  app2.disable("x-powered-by");
  app2.use((_req, res, next) => {
    const requestId = crypto3.randomUUID();
    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  });
  app2.use(express.json({ limit: "1mb" }));
  mountRoute(app2, "/api/health", { GET });
  mountRoute(app2, "/api/general", { GET: GET2 });
  mountRoute(app2, "/api/candidates", { GET: GET3 });
  mountRoute(app2, "/api/screener/ranked", { GET: GET4 });
  mountRoute(app2, "/api/screener/rsi", { GET: GET5 });
  mountRoute(app2, "/api/screener/bid-offer", { GET: GET6 });
  mountRoute(app2, "/api/sector/strength", { GET: GET7 });
  mountRoute(app2, "/api/history/bid-offer", { GET: GET8 });
  mountRoute(app2, "/api/stock/:code/detail", { GET: GET9 });
  mountRoute(app2, "/api/:code/ohlc", { GET: GET10 });
  mountRoute(app2, "/api/:code/rsi", { GET: GET11 });
  mountRoute(app2, "/api/:code/foreign", { GET: GET12 });
  mountRoute(app2, "/api/:code/bid-offer", { GET: GET13 });
  mountRoute(app2, "/api/predictions", {
    GET: GET14,
    POST
  });
  mountRoute(app2, "/api/predictions/stats", { GET: GET15 });
  mountRoute(app2, "/api/instruments", { GET: GET16 });
  mountRoute(app2, "/api/instruments/:symbol/ohlc", { GET: GET17 });
  mountRoute(app2, "/api/analyses", {
    GET: GET18,
    POST: POST2
  });
  mountRoute(app2, "/api/ingest", { POST: POST3 });
  mountRoute(app2, "/api/debug", { GET: GET19 });
  app2.use((error, _req, res, _next) => {
    const requestId = String(res.locals.requestId ?? "");
    if (isApiError(error)) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          requestId
        }
      });
      return;
    }
    console.error("[server] unhandled request error:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
        requestId
      }
    });
  });
  return app2;
}
var init_app = __esm({
  "src/server/app.ts"() {
    init_ExpressContext();
    init_errors();
    init_health();
    init_general();
    init_candidates();
    init_ranked();
    init_rsi();
    init_bid_offer();
    init_strength();
    init_bid_offer2();
    init_detail();
    init_ohlc();
    init_rsi2();
    init_foreign();
    init_bid_offer3();
    init_predictions();
    init_stats();
    init_instruments();
    init_ohlc2();
    init_analyses();
    init_ingest();
    init_debug();
  }
});

// src/api/vercel-handler.ts
var app = null;
var dbReady = null;
async function getApp() {
  if (app === null) {
    const { createApp: createApp2 } = await Promise.resolve().then(() => (init_app(), app_exports));
    app = createApp2();
  }
  return app;
}
function ensureDb() {
  if (dbReady === null) {
    dbReady = Promise.resolve().then(() => (init_Database(), Database_exports)).then((m) => m.initDb()).catch((error) => {
      console.error("[api] initDb failed:", error);
      dbReady = null;
      throw error;
    });
  }
  return dbReady;
}
async function handler(req, res) {
  try {
    const expressApp = await getApp();
    await ensureDb();
    return new Promise((resolve, reject) => {
      res.on("finish", resolve);
      res.on("error", reject);
      expressApp(req, res, (error) => {
        if (error != null) reject(error);
      });
    });
  } catch (error) {
    console.error("[api] Handler error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error"
        }
      }));
    }
  }
}
export {
  handler as default
};

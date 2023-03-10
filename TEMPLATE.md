## Templates

The generator uses templates to produce the output proto files. The semantics of the templating is based on [underscore](https://www.npmjs.com/package/underscore).

Available variables in template files:

- `root`: string - the name of the output folder (can be used for package name)
- `enums`: a collection of rpc enums based on the **enums** defined in the prisma schema
- `types`: a collection of rpc messages based on the **types** defined in the prisma schema
- `models`: a collection of rpc messages based on the **models** defined in the prisma schema
- `services`: a collection of rpc services based on the **models** defined in the prisma schema
- `changeCase`: the [change-case](https://www.npmjs.com/package/change-case) library for transforming values (can be accessed as `<%= changeCase.pascalCase(...) %>`)

If you don't define your custom templates to use, this is the default generated structure:

```
models
  - models.proto
  prisma
    - prisma.proto
services
  {model}
    v1
      {model}.proto
```

For any file paths, you can use the dynamic `{model}` for naming any directory / file name, which will result in using the file in a loop for each model found in the prisma schema. These files will receive a two extra variables which you can use in the templates:

- `model`: the matching model definition
- `service`: the matching service definition

You'll notice that lots of the proto 

#### Enums

```
// schema.prisma
enum Role {
  USER
  ADMIN
}

↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ 

[
  {
    name: 'Role',
    fields: [
      {
        name: 'USER'
      },
      {
        name: 'ADMIN'
      }
    ]
  }
]

↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ 
// proto template

<% enums.forEach((e) => { %>
enum <%= e.name %> {
    <%= `${e.name.toUpperCase()}_UNSPECIFIED` %> = 0;<%
 e.fields.forEach((f, i) => { %>
    <%= `${e.name.toUpperCase()}_${f.name.toUpperCase()}` %> = <%= i + 1 %>;<% })%>
}
```

#### Models

```
// schema.prisma
model User {
  id           Int              @id @default(autoincrement())
  name         String?
  email        String           @unique
  role         Role             @default(USER)
  createdAt    DateTime         @default(now())
  coinflips    Boolean[]
}

↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ 

[
  {
    messages: [
      {
        name: 'User',
        dependencies: ['google/protobuf/timestamp.proto'],
        fields: [
          {
            type: 'sint64',
            name: 'id'
          },
          {
            type: 'string',
            name: 'name',
            opt: 'optional'
          },
          {
            type: 'string',
            name: 'email'
          }
          {
            type: 'Role',
            name: 'role',
            internal: true
          }
          {
            type: 'google.protobuf.Timestamp',
            name: 'createdAt',
            dependency: 'google/protobuf/timestamp.proto'
          }
          {
            type: 'bool',
            name: 'coinflips',
            rep: 'repeated'
          }
        ]
      }
    ],
    dependencies: ['google/protobuf/timestamp.proto']
  }
]

↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ 
// proto template

<% models.dependencies.forEach((d) => { %>import "<%= d %>";
<% })%>
<% models.messages.forEach(m => { %>
message <%= m.name %> { <%
 m.fields.forEach((f, i) => { %>
    <%= [f.opt, f.rep, f.type, changeCase.snakeCase(f.name)].filter(f => !!f).join(' ') %> = <%= i + 1 %>;<% }) %>
}
<% }) %>

```

#### Services

From each prisma model we get a generated service definition. A service will have the following type signature:
```
type Operation = {
  name: string
  req: Message
  res: Message
}

type Service = {
  name: string
  operations: Operation[]
  dependencies: string[]
  messages: Message[]
}
```

Each service will support the following handlers, based on the the [prisma client specs](https://www.prisma.io/docs/concepts/components/prisma-client/crud), with a lot more limited set of support.

It compiles definitions for the following operations: `Find`, `FindMany`, `Create`, `Update`, `Delete`.

Each operation will have a request and response message attached, which can then be used to define the rpc handler.

For more insight, check out the [default service template](./packages/generator/src/template/services/{model}.proto).

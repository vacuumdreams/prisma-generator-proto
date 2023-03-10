# prisma-generator-proto

Generate protobuf service definitions based on prisma models. 

## Dependencies

- [prisma](https://www.prisma.io/docs/concepts/components/prisma-cli/installation)
- [buf](https://docs.buf.build/installation) (required only when you're using the default templates)

## Options

You can define the generator in your prisma schema in the following way:

```
generator proto {
  provider = "npx prisma-generator-proto"
  output   = "../"
  template = "./template"
  after    = "node run something"
}
```

The template and the after fields are optional. 

- `output`: a parent directory for the generated proto files
- `template`: lets you configure your own custom source for template files (mode about templates [here](./TEMPLATE.md))
- `after`: any executable you'd like to run after the generation finishes - this might be useful if you're workflow requires generating further code using the proto files as sources (e.g. compiling proto clients, etc)

> This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)

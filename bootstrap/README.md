<!-- -*- fill-column: 100 -*- -->
# Bootstrapping

This directory is for bootstrapping the operator. You run the Pulumi program here to install the
operator, as well as a Stack object which will keep its configuration synced from git:

```
ASCII-art goes here
```

Here's how to do it:

```shell
# Set the access token, stack name, and repo
#
# Copy your access token to the clipboard and do something like
pulumi config set --secret pulumiAccessToken $(pbpaste)
# (you may need to use e.g., xclip -o rather than pbpaste)
#
# Create a stack and use the name here:
pulumi config set stackName squaremo/bootstrap/pulumi-warmup
#
# Supply the URL for your fork of this repo:
pulumi config set stackProjectRepo https://github.com/squaremo/pulumi-warmup.git
```


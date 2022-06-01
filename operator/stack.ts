// Copyright 2022, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as operator from "./operator";

const resourceName = "pulumi-kubernetes-operator-sync";

// The resource needs a fully-qualified stack, since it's not running in the context of a user
// account. It's unclear how you would calculate the fully-qualified name even when running in the
// context of a user, so I've done a halfway job, with the user (/org) hard-wired.
const stackName = `squaremo/${pulumi.getProject()}/${pulumi.getStack()}`;

// This creates a "Stack" object pointing at the operator configuration in this repo.
function OperatorStack(predecessor, config) {
    return new k8s.apiextensions.CustomResource(resourceName, {
        apiVersion: 'pulumi.com/v1',
        kind: 'Stack',
        metadata: {}, // this is a workaround to make sure the metadata can be used as an output
        spec: {
            stack: stackName,
            projectRepo: config.stackProjectRepo,
            branch: "refs/heads/main",
            repoDir: 'operator',
            config, // just use it as given
            envRefs: {
                PULUMI_ACCESS_TOKEN:
                {
                    type: "Secret",
                    secret: {
                        name: config.secretName,
                        key: "accessToken",
                    },
                },
            },
            destroyOnFinalize: true,
        },
    }, {dependsOn: predecessor});
}

export {OperatorStack};

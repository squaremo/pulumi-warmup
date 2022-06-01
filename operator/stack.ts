// Copyright 2022, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as operator from "./operator";

const resourceName = "pulumi-kubernetes-operator";

// This creates a "Stack" object pointing at the operator
// configuration in this repo.
function OperatorStack(stackName, pulumiSecretName, repo, predecessor, provider) {
    return new k8s.apiextensions.CustomResource(resourceName, {
        apiVersion: 'pulumi.com/v1',
        kind: 'Stack',
        metadata: {}, // this is a workaround to make sure the metadata can be used as an output
        spec: {
            stack: stackName,
            projectRepo: repo,
            branch: "refs/heads/master",
            repoDir: 'operator',
            config: {
                 // these tie the knot between the bootstrap invocation (where e.g., the secret is created)
                // and the ongoing sync (which simply has to refer to the name)
                'secretName': pulumiSecretName,
                'stackProjectRepo': repo,
            },
            envRefs: {
                PULUMI_ACCESS_TOKEN:
                {
                    type: "Secret",
                    secret: {
                        name: pulumiSecretName,
                        key: "accessToken",
                    },
                },
            },
            destroyOnFinalize: true,
        },
    }, {dependsOn: predecessor, });
}

export {OperatorStack};

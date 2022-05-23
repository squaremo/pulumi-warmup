// Copyright 2022, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as operator from "./operator";

// The expected name of a secret with the Pulumi access token
const pulumiSecretName = "pulumi-secret";
const resourceName = "pulumi-kubernetes-operator";

// This creates a "Stack" object pointing at the operator
// configuration in this repo.
function OperatorStack(stackName, repo, predecessor, provider) {
    return new k8s.apiextensions.CustomResource(resourceName, {
        apiVersion: 'pulumi.com/v1',
        kind: 'Stack',
        spec: {
            stack: stackName,
            projectRepo: repo,
            branch: "refs/heads/master",
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
    }, {dependsOn: predecessor});
}

export {OperatorStack, pulumiSecretName};

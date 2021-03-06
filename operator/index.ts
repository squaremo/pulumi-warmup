// Copyright 2022, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import {deploymentName, PulumiKubernetesOperator} from "./operator";
import {OperatorStack} from "./stack";

// Retrieve the secret name from the bootstrapping

const config = new pulumi.Config()
const stackConfig = {
    pulumiSecretName: config.require('secretName'),
    stackProjectRepo: config.require('stackProjectRepo'),
};

const provider = new k8s.Provider("k8s", {enableReplaceCRD: true});

// This is the definition of the operator itself.
const op = new PulumiKubernetesOperator(deploymentName, {provider});

// Now, construct a Stack custom resource to sync this program.
const opstack = OperatorStack(op, stackConfig);

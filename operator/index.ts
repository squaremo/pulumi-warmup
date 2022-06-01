// Copyright 2022, Pulumi Corporation.  All rights reserved.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import {PulumiKubernetesOperator, deploymentName, namespace} from "./operator";
import {OperatorStack} from "./stack";

// Retrieve the secret name from the bootstrapping

const config = new pulumi.Config()
const pulumiSecretName = config.require('secretName');
const stackProjectRepo = config.require('stackProjectRepo');

// Punting on the stack name, I don't really know what this should
// be. I'm using the same calculation as for the bootstrap; I think
// that means it'll go to the same place in the service, which is what
// I want. Possibly it should be constructed to include an org or
// account name.
const stackName = `${pulumi.getProject()}/${pulumi.getStack()}`;

// This is the definition of the operator itself.

const op = PulumiKubernetesOperator(deploymentName, {namespace});

// This is the definition of a Stack that applies this program.

const opstack = OperatorStack(stackName, pulumiSecretName, stackProjectRepo, op.crds);

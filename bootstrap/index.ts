// Copyright 2022, Pulumi Corporation.  All rights reserved.

// This file is used to bootstrap the operator, by creating necessary
// secrets (taken from local config), and running the operator with a
// stack pointed back at this git repo.

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

// These imports include consts that are used just so the bootstrap
// deployment is the same (and in the same place) as the
// stack-configured deployment.
import {OperatorStack} from "../operator/stack";
import {namespace, deploymentName, PulumiKubernetesOperator} from "../operator/operator";

const pulumiSecretName = "pulumi-secret";
const stackName = `${pulumi.getProject()}/${pulumi.getStack()}`;

// By default, uses $HOME/.kube/config when no kubeconfig is set. For bootstrapping, that's what I want.
const provider = new k8s.Provider("k8s", {enableReplaceCRD: true});

// Get things like the Pulumi API token and URL for the repo, from
// config.
const config = new pulumi.Config();
const pulumiAccessToken = config.requireSecret("pulumiAccessToken");

// const awsAccessKeyId = config.require("awsAccessKeyId");
// const awsSecretAccessKey = config.requireSecret("awsSecretAccessKey");
// const awsSessionToken = config.requireSecret("awsSessionToken");

const stackProjectRepo = config.get("stackProjectRepo") || "https://github.com/squaremo/pulumi-warmup.git";

// Create the creds as a Kubernetes Secret; this will be referenced by the operator stack.
const accessToken = new kx.Secret(pulumiSecretName, {
    stringData: {accessToken: pulumiAccessToken},
});

// TODO the name is something that might need to be exported as an
// output too, if something needs to synchronise on it.
const op = new PulumiKubernetesOperator(deploymentName, {namespace, provider});

// Install a stack which will sync the operator configuration.
const opstack = OperatorStack(stackName, accessToken.metadata.name, stackProjectRepo, op.crds, provider);

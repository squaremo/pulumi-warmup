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
import {deploymentName, PulumiKubernetesOperator} from "../operator/operator";

const pulumiSecretName = 'pulumi-secret';

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

// This is here (in bootstrap) mainly as a workaround -- I cannot understand what behaviour to
// expect whe0n reapplying it.
function installCRDs(name: string, fileURL: string): k8s.yaml.ConfigFile {
    return new k8s.yaml.ConfigFile(name, {file: fileURL})
}
const crds = installCRDs('pulumi-stack-crd', "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/master/deploy/crds/pulumi.com_stacks.yaml");

// TODO the name is something that might need to be exported as an
// output too, if something needs to synchronise on it.
const op = new PulumiKubernetesOperator(deploymentName, {provider}, {dependsOn: crds});

// These are given to the stack object so it can recursively create itself while keeping the same
// names for things.
const stackConfig = {
    secretName: accessToken.metadata.name,
    stackProjectRepo: stackProjectRepo,
};

// Install a stack which will sync the operator configuration.
const opstack = OperatorStack(op, stackConfig);

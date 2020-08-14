@Library('kibo-pipeline-shared-lib')_



ngProjectPipeline (
	SUPPORTS_NUGET: false,
	SCALE_UNITS: ['sb'],
    DOCKER_IMAGE : 'kibo/mozu-sitebuilder-ui',
    DOCKER_REPO: '542216209467.dkr.ecr.us-east-1.amazonaws.com',
    DOCKERFILE : './Dockerfile',
    KUBE_TARGET_PORT :'80',
    KUBE_SERVICE_PORT : '80',
	INGRESS_PATH_MATCH: '/',
	INGRESS_REWRITE_TARGET: '/',
	INGRESS_HOST_PREFIX :'sitebuilder',
	KUBE_HEALTHCHECK_URL: '/_mzhealth',
    KUBE_SERVICE_NAME :'mozu-sitebuilder-ui',
    KUBE_TEMPLATE_FILE : 'com/kibo/kubernetes/ng-web-service.yml');





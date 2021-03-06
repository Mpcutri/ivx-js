export class VideoStateSchema {
    constructor(state) {
        this.state = state;
    }

    validate() {
        return tv4.validateMultiple(this.state, this.schema);
    }

    get schema() {
        return {
            "type": "object",
            "properties": {
                "playerSettings": {
                    "type": "object",
                    "properties": {
                        "autoplay": {
                            "type": "boolean"
                        },
                        "controls": {
                            "type": ["boolean", "string", "object"],
                            "properties": {
                                "type": {
                                    "type": ["boolean", "string"]
                                },
                                "classes" : {
                                    "type" : "string"
                                },
                                "required" : ["type"]
                            }
                        },
                        "attributes": {
                            "type": "object"
                        },
                        "src": {
                            "type": "string"
                        },
                        "sources": {
                            "type": "array",
                            "items": [{
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["video/mp4", "video/webm", "video/ogg"]
                                    },
                                    "src": {
                                        "type": "string"
                                    }
                                },
                                "required": ["src", "type"]
                            }],
                            "minItems": "1"
                        },
                        "tracks": {
                            "type": "array",
                            "items": [{
                                "type": "object",
                                "properties": {
                                    "id": {
                                        "type": "string"
                                    },
                                    "src": {
                                        "type": "string"
                                    },
                                    "kind": {
                                        "type": "string"
                                    },
                                    "default": {
                                        "type": "boolean"
                                    },
                                    "cues": {
                                        "type": "array",
                                        "items": [{
                                            "type": "object",
                                            "properties": {
                                                "id": {
                                                    "type": "string"
                                                },
                                                "start": {
                                                    "type": "number"
                                                },
                                                "end": {
                                                    "type": "number"
                                                },
                                                "payload": {
                                                    "type": "string"
                                                },
                                                "align": {
                                                    "type": "string"
                                                },
                                                "position": {
                                                    "type": "string"
                                                },
                                                "size": {
                                                    "type": "string"
                                                },
                                                "vertical": {
                                                    "type": "string"
                                                }
                                            },
                                            "required": ["id", "start", "end", "payload"]
                                        }]
                                    },
                                    "required": ["id", "kind"]

                                }
                            }]
                        }
                    },
                    "oneOf": [{
                        "required": ["src"]
                    }, {
                        "required": ["sources"]
                    }, {
                        "required": ["vimeoId"]
                    }, {
                        "required": ["youtubeId"]
                    }]
                },
                "personalizations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "html": {
                                "type": "string"
                            },
                            "templateUrl": {
                                "type": "string"
                            }
                        },
                        "required": ["id"],
                        "oneOf": [{
                            "required": ["html"]
                        }, {
                            "required": ["templateUrl"]
                        }]
                    }
                },
                "cuePoints": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "timeAt": {
                                "type": "number",
                                "minimum": 0
                            },
                            "endAt": {
                                "type": "number",
                                "minimum": 0
                            },
                            "eventName": {
                                "type": "string"
                            },
                            "args": {
                                "type": "object"
                            }
                        },
                        "required": ["eventName"]
                    }
                }
            },
            "required": ["playerSettings"]
        }
    }

}
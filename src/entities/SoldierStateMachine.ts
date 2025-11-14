import {setup} from "xstate";

export const soldierMachine = setup({
    types: {
        context: {} as { isDodging: boolean },
        events: {} as
            | { type: "ENEMY_SPOTTED" }
            | { type: "HUNT" }
            | { type: "RUN" }
            | { type: "DODGE_ON" }
            | { type: "DODGE_OFF" }
            | { type: "ENEMY_LOST" }
            | { type: "KILL" }
            | { type: "POINT_REACHED" },
    },
    actions: {
        startRetreating: function ({context, event}, params) {
            // Add your action code here
            // ...
        },
        startPursuing: function ({context, event}, params) {
            // Add your action code here
            // ...
        },
        interruptMovement: function ({context, event}, params) {
            // Add your action code here
            // ...
        },
        enableDodging: function ({context, event}, params) {
            console.log(context);
        },
        disableDodging: function ({context, event}, params) {
            // Add your action code here
            // ...
        },
        startExploring: function ({context, event}, params) {
            // Add your action code here
            // ...
        },
    },
}).createMachine({
    context: {
        isDodging: true,
    },
    id: "soldier",
    initial: "alive",
    states: {
        alive: {
            always: {
                target: "exploring",
            },
        },
        exploring: {
            after: {
                "100": {
                    target: "movement",
                },
            },
        },
        movement: {
            on: {
                ENEMY_SPOTTED: {
                    target: "combat",
                    actions: {
                        type: "interruptMovement",
                    },
                },
                POINT_REACHED: {
                    target: "exploring",
                },
            },
        },
        combat: {
            initial: "attack",
            on: {
                ENEMY_LOST: {
                    target: "exploring",
                    actions: {
                        type: "startExploring",
                    },
                },
                KILL: {
                    target: "dead",
                },
            },
            states: {
                attack: {
                    initial: "retreating",
                    on: {
                        DODGE_ON: {
                            actions: {
                                type: "enableDodging",
                            },
                        },
                        DODGE_OFF: {
                            actions: {
                                type: "disableDodging",
                            },
                        },
                    },
                    states: {
                        retreating: {
                            on: {
                                HUNT: {
                                    target: "pursuing",
                                },
                            },
                            entry: {
                                type: "startRetreating",
                            },
                        },
                        pursuing: {
                            on: {
                                RUN: {
                                    target: "retreating",
                                },
                            },
                            entry: {
                                type: "startPursuing",
                            },
                        },
                    },
                },
            },
        },
        dead: {
            type: "final",
        },
    },
});

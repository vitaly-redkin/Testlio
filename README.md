 # Testlio Trial Task - issue-service

## Description
All projects in Testlio contain issues. Issues describe problems and bugs, found by testers in client applications. Your job for today will be to work on Testlio's issue-service. The issue-service is meant to be a microservice containing a simple REST API. An initial project with some example code has been set up for you.

**Project location:** `~/Developer/testlio-trial`

#### Preparations and workflow
* Create your own git branch in the format `solution/{forename}-{surname}`, e.g. `solution/peter-griffin`
* We encourage you to commit often, but feel free to use whatever approach works best for you
* Currently the project repository has no remote set up, please keep it that way

#### Currently implemented:
* Part of REST API (discovery and fetching single issue) using [Node.js](https://nodejs.org) and [koa](http://koajs.com/)
* MYSQL database with table for issues
* [Sequelize](http://docs.sequelizejs.com/) model for issues

#### Issue format

This is a sample issue to illustrate the issue item structure:

```
{
    title: 'Bug in issue-service',
    description: 'Ah snap :('
}
```

## Tasks

#### Task 1: Implement an endpoint that creates a new issue
Create issue endpoint creates a new issue in the DB.

**Implement:**
* `POST /issues` endpoint that creates new issue

#### Task 2: Implement endpoints to change and list issues
Currently one can get issues one by one from the issue-service, but there is no way of modifying an issue or knowing what issues are in the database.

**Implement:**
* `PUT /issues/:id` endpoint that modifies issue data
* `GET /issues` endpoint that returns all stored issues

#### Task 3: Implement issue revisions
Issues being one of the central models of Testlio, it is important to be able to track the changes made to them. Every time a POST or PUT is done to an issue, we want to track what was changed and when.

Each change is a **revision**, containing the issue current state and the change made.

_For example:_
```
{
  "issue": {
    "title": "Bug in issue-service",
    "description": "It does not generate revisions"
  },
  "changes": {
    "description": "It does not generate revisions"
  },
  "updatedAt": "2017-03-29T15:40:42.000Z"
}
```

**Implement:**
* Modify **POST** endpoint (issue creation) to create an issue revision
* Modify **PUT** endpoint (issue modification) to create an issue revision
* Implement **GET** /issues/:id/revisions that returns all issue revisions

_Example flow:_
1. We have an existing issue in DB:
```
{
    "title": "Bug in issue-service",
    "description": "Ah snap :("
}
```
2. Issue description is updated via PUT request with payload:
```
{
    description: 'It does not generate revisions'
}
```
3. Issue is updated to:
```
{
    "title": "Bug in issue-service",
    "description": "It does not generate revisions"
}
```
4. A revision of the change is created and stored:
```
{
  "issue": {
    "title": "Bug in issue-service",
    "description": "It does not generate revisions"
  },
  "changes": {
    "description": "It does not generate revisions"
  },
  "updatedAt": "2017-03-29T15:40:42.000Z"
}
```

**Notice** That a revision returns both the issue as well as the exact changes that were made with the revision.

#### Task 4: Implement authorization
Add basic authorizer to POST and PUT endpoints. Every time a change is made to the DB, the author of the change must be known afterwards.

**Implement:**
* A JWT token authorizer that fetches an email from the token and stores it as the creator or updater of the issue.

#### Task 5: Before and after (Advanced)
Implement an endpoint that takes two revisions and returns the flattened difference between the two. It is assumed that comparisons work from older to newer revisions, however, for bonus-points of awesome, implement comparisons from newer to older revisions as well.

**Implement:**
* Implement **GET** /issues/:id/compare/:revisionA/:revisionB

_Example flow:_
1. We have an existing issue in DB:
```
{
    "title": "Bug in issue-service",
    "description": "Ah snap :("
}
```

2. We have three existing revisions in DB:
```
{
    "id": 1,
    "changes": {
        "description": "It does not generate revisions"
    },
    "updatedAt": "2017-03-29T15:40:42.000Z"
},
{
    "id": 2,
    "changes": {
        "description": "Ah snap :("
    },
    "updatedAt": "2017-03-30T10:40:40.000Z"
},
{
    "id": 3,
    "changes": {
        "title": "Bug in issue-service"
    },
    "updatedAt": "2017-03-30T11:40:40.000Z"
}
```

3. If we ask for a diff between 1 and 3, we receive
```
{
    "issue": {
        "before": {
            "title": "Buggy service",
            "description": "Will fill in once understood"
        },
        "after": {
            "title": "Bug in issue-service",
            "description": "Ah snap :("
        }
    },
    "changes": {
        "title": "Bug in issue-service",
        "description": "Ah snap :("
    },
    "revisions": [
        {
            "id": 1,
            "changes": {
                "description": "It does not generate revisions"
            },
            "updatedAt": "2017-03-29T15:40:42.000Z"
        },
        {
            "id": 2,
            "changes": {
                "description": "Ah snap :("
            },
            "updatedAt": "2017-03-30T10:40:40.000Z"
        },
        {
            "id": 3,
            "changes": {
                "title": "Bug in issue-service"
            },
            "updatedAt": "2017-03-30T11:40:40.000Z"
        }
    ]
}
```

4. If we ask for a diff between 2 and 3, we receive
```
{
    "issue": {
        "before": {
            "title": "Buggy service",
            "description": "It does not generate revisions"
        },
        "after": {
            "title": "Bug in issue-service",
            "description": "Ah snap :("
        }
    },
    "changes": {
        "title": "Bug in issue-service",
        "description": "Ah snap :("
    },
    "revisions": [
        {
            "id": 2,
            "changes": {
                "description": "Ah snap :("
            },
            "updatedAt": "2017-03-30T10:40:40.000Z"
        },
        {
            "id": 3,
            "changes": {
                "title": "Bug in issue-service"
            },
            "updatedAt": "2017-03-30T11:40:40.000Z"
        }
    ]
}
```

## FAQ
**Q:** Should I do the tasks in order?

**A:** Yes, we expect you to start from the easiest task and progress from there.

**Q:** What do you look for in the solution?

**A:** Ideally we would like to see a working solution at the end of the trial day. The solution does not have to be architecturally perfect, so first make it work, then make it pretty. If you have further ideas on design you can elaborate during the demo.

## Useful commands

* Install dependencies: `npm install`
* Start the local issue-service server: `npm start`

## References

Before attempting this task, you should familiarize yourself with the following:
* [Sequelize](http://docs.sequelizejs.com/en/latest/)
    * [Sequelize Model](http://docs.sequelizejs.com/manual/tutorial/models-usage.html)
* [Koa](http://koajs.com/)
* [Koa router](https://github.com/alexmingoia/koa-router)

**If you have any questions, don't hesitate to ask!**

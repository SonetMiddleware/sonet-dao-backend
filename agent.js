const {getTwitterCounts, getTwitterUserFollowers} = require("./app/utils/utils");

module.exports = agent => {
    setInterval(async () => {
        let appData = await agent.mysql.get('app');
        let chainData = await agent.mysql.get('chainData');
        let allTwitters = await appData.select('twitter_counts');
        let requestIDs = [];
        let count = 0;
        for (const t of allTwitters) {
            requestIDs.push(t.tid);
            count++;
            if (count === 50) { // api required up to 100 comma-separated Tweet IDs.
                try {
                    let results = await getTwitterCounts(requestIDs);
                    for (const tid of results.keys()) {
                        await appData.update('twitter_counts', results.get(tid), {where: {tid: tid}});
                    }
                } catch (e) {
                    agent.logger.error(`update twitter_counts failed, err ${e}`)
                }
                requestIDs = [];
                count = 0;
            }
        }
        try {
            let results = await getTwitterCounts(requestIDs);
            for (const tid of results.keys()) {
                await appData.update('twitter_counts', results.get(tid), {where: {tid: tid}});
            }
        } catch (e) {
            agent.logger.error(`update failed, err ${e}`)
        }

        let allDaoTwitters = await chainData.query(`select twitter
                                                    from collection
                                                    where dao_create_block > 0
                                                      and !ISNULL(twitter)
                                                      and twitter != ''`);
        let requestUsernames = [];
        count = 0;
        let totalAudiences = 0;
        for (const userName of allDaoTwitters) {
            const atIndex = userName.twitter.indexOf("@");
            requestUsernames.push(userName.twitter.substring(atIndex + 1));
            count++;
            if (count === 50) { // api required up to 100 comma-separated Tweet Usernames.
                try {
                    totalAudiences += await getTwitterUserFollowers(requestUsernames);
                    requestUsernames = [];
                    count = 0;
                } catch (e) {
                    agent.logger.error(`get total audience failed, err ${e}`)
                }
            }
        }
        let totalDaos = allDaoTwitters.length;
        let totalProposals = await appData.query(`select count(*) as total_proposals
                                                  from proposal`);
        totalProposals = totalProposals[0].total_proposals;
        await appData.insert('statistics', {
            time: Date.now(),
            total_daos: totalDaos,
            total_proposals: totalProposals,
            total_audiences: totalAudiences
        });
    }, 5 * 60 * 1000);
};

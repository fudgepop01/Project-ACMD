#include "MovementTracker.h"

namespace CPUMarkov {
    void MarkovSystem::iterate(Fighter* self) {
        // clear prediction cache
        predictionCache.ATTACK = -1;
        predictionCache.GRAB = -1;
        predictionCache.SHIELD = -1;
        predictionCache.HITSTUN = -1;
        predictionCache.AIR = -1;
        predictionCache.GROUND = -1;
        predictionCache.SWIM = -1;
        predictionCache.DASH = -1;
        predictionCache.INACTIONABLE = -1;

        ActionCategory category = MarkovEntry::getActionCategory(self->m_moduleAccesser->m_statusModule->getStatusKind());
        
        if (elements.isEmpty()) {
            snapshot(self, category);    
            return;
        }
        MarkovEntry* entry = elements.getNewest();
        entry->timeDiff += 1;
        // entry->xDist = // calculate x distance from CPU target
        // entry->yDistFromFloor = // get ydistance from floor using raycast
        entry->xPos = self->m_moduleAccesser->m_postureModule->getPos().x;
        // entry->xDistFromLedge = // calculate x distance from nearest ledge
    }
    void MarkovSystem::snapshot(Fighter* self, ActionCategory newCategory) {
        MarkovEntry* element = new MarkovEntry(
            0,
            , // calculate x distance from CPU target
            , // get y distance from floor using raycast
            self->m_moduleAccesser->m_postureModule->getPos().x,
            , // calculate x distance from nearest ledge
            newCategory
        );
        elements.push(element);
    }
    float MarkovSystem::predict(ActionCategory category) {
        if (elements.getCount() <= 16) return 0;
        switch (category) {
            case ActionCategory::NONE: { return 0; }
            case ActionCategory::ATTACK: { if (predictionCache.ATTACK >= 0) return predictionCache.ATTACK; }
            case ActionCategory::GRAB: { if (predictionCache.GRAB >= 0) return predictionCache.GRAB; }
            case ActionCategory::SHIELD: { if (predictionCache.SHIELD >= 0) return predictionCache.SHIELD; }
            case ActionCategory::HITSTUN: { if (predictionCache.HITSTUN >= 0) return predictionCache.HITSTUN; }
            case ActionCategory::AIR: { if (predictionCache.AIR >= 0) return predictionCache.AIR; }
            case ActionCategory::GROUND: { if (predictionCache.GROUND >= 0) return predictionCache.GROUND; }
            case ActionCategory::SWIM: { if (predictionCache.SWIM >= 0) return predictionCache.SWIM; }
            case ActionCategory::DASH: { if (predictionCache.DASH >= 0) return predictionCache.DASH; }
            case ActionCategory::INACTIONABLE: { if (predictionCache.INACTIONABLE >= 0) return predictionCache.INACTIONABLE; }
            case ActionCategory::LENGTH: { return 0; } 
        }

        // total possible "score" for this potential outcome
        float maxScore = 1;
        // "score" for this specific scenario
        float score = 1;

        vector<int> matchingIndices;
        for (int i = 1; i < elements.getCount(); i++) {
            if (elements.getElementAt(i)->category == category) {
                matchingIndices.push(i + 1);
            }
        }

        if (categoryMatchIndices.size() == 0) {
            if (elements.getElementAt(0)->category == category) {
                matchingIndices.push(0);
            } else {
                return 0;
            }
        }

        int lookAmount = elements.getCount() / 8;

        float scoreFadeInterval = 1 / (matchingIndices.size() + 1);
        float scoreMultiplier = 1;

        MarkovEntry current = *elements.getNewest();
        for (int i = 0; i < matchingIndices.size(); i++) {
            int matchIndex = matchingIndices[i];

            for (int lookingIdx = matchIndex; lookingIdx > matchIndex - lookAmount && lookingIdx > 0; lookingIdx--) {
                MarkovEntry prev = *elements.getElementAt(lookingIdx);

                score += scoreMultiplier * MarkovEntry::CalcScore(MarkovEntry::MInputTime, current.timeDiff, prev.timeDiff);
                score += scoreMultiplier * MarkovEntry::CalcScore(MarkovEntry::MInputYDistFloor, current.yDistFromFloor, prev.yDistFromFloor);
                score += scoreMultiplier * MarkovEntry::CalcScore(MarkovEntry::MInputXDist, current.xDist, prev.xDist);
                score += scoreMultiplier * MarkovEntry::CalcScore(MarkovEntry::MInputXPos, current.xPos, prev.xPos);
                score += scoreMultiplier * MarkovEntry::CalcScore(MarkovEntry::MInputXDistFromLedge, current.xDistFromLedge, prev.xDistFromLedge);
                score += scoreMultiplier * 
                        (current.category == prev.category) ? MarkovEntry::MInputCategory.weight : 0;
                        
                if (prev.category == category) {
                    score += 0.10 * scoreMultiplier * MarkovEntry::MInputCategory.weight * (prev.timeDiff * 0.10);
                } else {
                    maxScore += 0.05 * scoreMultiplier * MarkovEntry::MInputCategory.weight * (prev.timeDiff * 0.10);
                }

                maxScore += MarkovEntry::MTotalWeight;
            }

            scoreMultiplier -= scoreFadeInterval;
        }

        if (elements.getOldest()->category == category) {
            score *= 1 + ((current.timeDiff < 120) ? current.timeDiff : 120) * 0.1 / 12;
        }

        switch (category) {
            case ActionCategory::NONE: { return 0; }
            case ActionCategory::ATTACK: { predictionCache.ATTACK = score / maxScore; }
            case ActionCategory::GRAB: { predictionCache.GRAB = score / maxScore; }
            case ActionCategory::SHIELD: { predictionCache.SHIELD = score / maxScore; }
            case ActionCategory::HITSTUN: { predictionCache.HITSTUN = score / maxScore; }
            case ActionCategory::AIR: { predictionCache.AIR = score / maxScore; }
            case ActionCategory::GROUND: { predictionCache.GROUND = score / maxScore; }
            case ActionCategory::SWIM: { predictionCache.SWIM = score / maxScore; }
            case ActionCategory::DASH: { predictionCache.DASH = score / maxScore; }
            case ActionCategory::INACTIONABLE: { predictionCache.INACTIONABLE = score / maxScore; }
            case ActionCategory::LENGTH: { return 0; } 
        }

        return score / maxScore;
    }
};
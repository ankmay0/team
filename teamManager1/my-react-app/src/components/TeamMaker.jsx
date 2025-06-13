import { useState, useEffect } from "react";
import FileHandler from "./FileHandler.jsx";
import {
  Container,
  Typography,
  FormGroup,
  Box,
  Grid,
  Checkbox,
  TextField,
  Divider,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { grey } from "@mui/material/colors";

const filter = createFilterOptions();

const TeamMaker = ({ teams }) => {
  //memberSkills will hold the selected skills for each team order (checkbox : true / false , 101 :<selected skill 1> ,102:<selected skill2>)
  const [memberSkills, setMemberSkills] = useState({});
  // allSkills will hold all the skills for each team member with key as memberId
  const [allSkills, setAllSkills] = useState({});
  const [uploadedData, setUploadedData] = useState(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.forEach((skill) => {
          if (!grouped[skill.employeeId]) grouped[skill.employeeId] = [];
          grouped[skill.employeeId].push(skill);
        });
        setAllSkills(grouped);
      });
  }, []);

  const toggleCheckbox = (teamId) => {
    setMemberSkills((prev) => {
      const existing = prev[teamId] || { checked: false, skills: {} };
      return {
        ...prev,
        [teamId]: { ...existing, checked: !existing.checked },
      };
    });
  };

  const addSkill = (memberId, expertise) => {
    const newSkill = {
      id: Date.now(),
      employeeId: memberId,
      expertise,
      experience: "N/A",
    };
    setAllSkills((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), newSkill],
    }));
    return newSkill;
  };

  const updateSkill = (teamId, memberId, skill) => {
    setMemberSkills((prev) => {
      const team = prev[teamId] || { checked: true, skills: {} };
      return {
        ...prev,
        [teamId]: {
          ...team,
          skills: {
            ...team.skills,
            [memberId]: skill,
          },
        },
      };
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, border: 1, borderColor: grey[400], borderRadius: 2 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mt: 7, mb: 4, textAlign: "center" }}>
        Team Skill Assignment
      </Typography>

      {teams?.length ? (
        <FormGroup>
          {teams.map((team) => {
            

            const members = [
              { id: team.srcId, name: team.srcName },
              { id: team.targetId, name: team.targetName },
            ];

            return (
              <Box key={team.teamId} sx={{ py: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Checkbox
                    checked={memberSkills?.[team.teamId]?.checked}
                    onChange={() => toggleCheckbox(team.teamId)}
                  />

                  {members.map((member) => (
                    <Grid item key={member.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6" sx={{ minWidth: 100, fontWeight: "bold" }}>
                          {member.name}
                        </Typography>

                        <Autocomplete
                          disabled={!memberSkills?.[team.teamId]?.checked}
                          value={memberSkills?.[team.teamId]?.skills?.[member.id] || null}
                          options={[
                            {
                              disabled: true,
                              expertise: "Skill",
                              experience: "Experience",
                            },
                            ...(allSkills[member.id] || []),
                          ]}
                          filterOptions={(opts, params) => {
                            const filtered = filter(opts, params);
                            if (
                              params.inputValue &&
                              !opts.some(
                                (o) =>
                                  o.expertise?.toLowerCase() === params.inputValue.toLowerCase()
                              )
                            ) {
                              filtered.push({
                                inputValue: params.inputValue,
                                expertise: Add "${params.inputValue}",
                              });
                            }
                            return filtered;
                          }}
                          getOptionLabel={(option) => option.inputValue || option.expertise || ""}
                          onChange={(e, val) => {
                            if (!val || val.disabled) return;
                            const skill =
                              typeof val === "string"
                                ? addSkill(member.id, val)
                                : val.inputValue
                                ? addSkill(member.id, val.inputValue)
                                : val;
                            updateSkill(team.teamId, member.id, skill);
                          }}
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              key={option.id || option.inputValue}
                              style={{
                                fontWeight: option.disabled ? "bold" : "normal",
                                pointerEvents: option.disabled ? "none" : "auto",
                                display: "flex",
                                justifyContent: "space-between",
                                paddingRight: 16,
                                minWidth: 300,
                              }}
                            >
                              <span>{option.expertise}</span>
                              <span>{option.experience || ""}</span>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField {...params} label="Select or Add Expertise" sx={{ minWidth: 300 }} />
                          )}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mt: 4, borderColor: "rgb(178, 176, 239)", borderBottomWidth: 2 }} />
              </Box>
            );
          })}
        </FormGroup>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 2 }}>No team data available.</Typography>
      )}

      <FileHandler
        selections={memberSkills}
        developerNames={teams.reduce((acc, team) => {
          acc[team.srcId] = team.srcName;
          acc[team.targetId] = team.targetName;
          return acc;
        }, {})}
        onDataUpload={setUploadedData}
        uploadedData={uploadedData}
      />
    </Container>
  );
};

export default TeamMaker;

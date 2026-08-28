# Action: turn an invariant into a gate

**Input** a rule the estate believes but does not check — usually discovered because it
was just broken.

**Method**
1. Write the rule as one sentence a test can assert.
2. Write the test so it **fails first**, against the broken state. A gate never seen red
   is not known to work.
3. Put it in the suite for its area, or in `build.test.mjs` if it is about the repository
   rather than the code.
4. Make the failure message name the thing that broke, not the rule that noticed.

**Done test** the gate fails on the known-bad case and passes on the fixed one.

**Standing example** the size-guideline gate found five modules over the limit with
nothing said in their headers, on its first run.
